#!/usr/bin/env ruby
# frozen_string_literal: true

# configure-watch-target.rb
#
# Watch アプリをビルドするための standalone Xcode project を
# watch-app/ ディレクトリに生成する。
# Expo prebuild 後に実行すること。
#
# 冪等: 既存の xcodeproj が存在すれば何もしない。
#
# Xcode 16 の "Multiple commands produce ... watchos/.app" バグを回避するため、
# watch target をメインの Xcode project (Hakuto.xcodeproj) に追加せず、
# 独立したプロジェクトとして管理する。
#
# Usage:
#   ruby scripts/configure-watch-target.rb
#
# 依存: gem install xcodeproj

require 'fileutils'
require 'xcodeproj'

REPO_ROOT = File.expand_path(File.join(__dir__, '..'))
WATCH_DIR = File.join(REPO_ROOT, 'watch-app')
WATCH_PROJECT_PATH = File.join(WATCH_DIR, 'HakutoWatch.xcodeproj')
WATCH_TARGET_NAME = 'HakutoWatch'
WATCH_BUNDLE_ID = 'com.pigeonworks.hakuto.watch'
WATCH_DEPLOYMENT_TARGET = '10.0'
WATCH_SWIFT_VERSION = '5.4'

def fail!(msg)
  warn "✗ #{msg}"
  exit 1
end

def ok(msg)
  puts "✓ #{msg}"
end

# --- Preflight ---
fail!("watch-app dir not found: #{WATCH_DIR}") unless File.exist?(WATCH_DIR)

# --- Idempotent check ---
if File.exist?(WATCH_PROJECT_PATH)
  ok "watch project already exists at #{WATCH_PROJECT_PATH} — skipping"
  exit 0
end

# --- Create standalone watch project ---
project = Xcodeproj::Project.new(WATCH_PROJECT_PATH)

watch_target = project.new_target(
  :application,
  WATCH_TARGET_NAME,
  :watchos,
  WATCH_DEPLOYMENT_TARGET,
  nil,
  :swift
)

watch_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = WATCH_BUNDLE_ID
  config.build_settings['SWIFT_VERSION'] = WATCH_SWIFT_VERSION
  config.build_settings['SDKROOT'] = 'watchos'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '4'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  config.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = 'Hakuto'
  config.build_settings['INFOPLIST_KEY_CFBundleName'] = 'Hakuto'
  config.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = ''
  config.build_settings['INFOPLIST_KEY_WKCompanionAppBundleIdentifier'] = 'com.pigeonworks.hakuto'
  config.build_settings['SKIP_INSTALL'] = 'YES'
  config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'NO'
  config.build_settings['BUILD_VARIANTS'] = 'normal'
end

# --- Add Swift source files ---
watch_group = project.main_group.new_group('HakutoWatch', WATCH_DIR)
watch_group.path = '.'
watch_group.source_tree = 'SOURCE_ROOT'

Dir.glob(File.join(WATCH_DIR, '*.swift')).sort.each do |swift_file|
  file_ref = watch_group.new_reference(swift_file)
  watch_target.source_build_phase.add_file_reference(file_ref)
end

# --- Save ---
project.save(WATCH_PROJECT_PATH)
ok "created watch project at #{WATCH_PROJECT_PATH} with #{Dir.glob(File.join(WATCH_DIR, '*.swift')).length} Swift files"
