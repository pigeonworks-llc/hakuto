#!/usr/bin/env ruby
# frozen_string_literal: true

# configure-watch-target.rb
#
# Expo prebuild 後に ios/ の Xcode project に watchOS app target を追加する。
# 冪等: 既存の watch target があれば何もしない。
#
# Usage:
#   ruby scripts/configure-watch-target.rb [ios/ へのパス]
#
# 依存: gem install xcodeproj

require 'xcodeproj'

IOS_DIR = ARGV[0] || File.join(__dir__, '..', 'ios')
PROJECT_PATH = File.join(IOS_DIR, 'Hakuto.xcodeproj')
WATCH_APP_DIR = File.join(File.dirname(IOS_DIR), 'watch-app')

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
fail!("xcodeproj not found: #{PROJECT_PATH}") unless File.exist?(PROJECT_PATH)
fail!("watch-app dir not found: #{WATCH_APP_DIR}") unless File.exist?(WATCH_APP_DIR)

# --- Load project ---
project = Xcodeproj::Project.open(PROJECT_PATH)
main_group = project.main_group

# --- Check if watch target already exists (idempotent) ---
existing = project.targets.find { |t| t.name == WATCH_TARGET_NAME }
if existing
  ok "watch target '#{WATCH_TARGET_NAME}' already exists — skipping"
  project.save
  exit 0
end

ok "no existing watch target found — creating"

# --- Create watchOS target ---
watch_target = project.new_target(
  :application,
  WATCH_TARGET_NAME,
  :watchos,
  WATCH_DEPLOYMENT_TARGET,
  nil,
  :swift
)
watch_target.product_reference.name = WATCH_TARGET_NAME
watch_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = WATCH_BUNDLE_ID
  config.build_settings['SWIFT_VERSION'] = WATCH_SWIFT_VERSION
  config.build_settings['SDKROOT'] = 'watchos'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '4'
  config.build_settings['INFOPLIST_FILE'] = 'HakutoWatch/Info.plist'
  config.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  config.build_settings['SKIP_INSTALL'] = 'YES'
end

# --- Create watch group and add Swift files ---
watch_group_key = nil
main_group.children.each do |child|
  if child.is_a?(Xcodeproj::Project::Object::PBXGroup) && child.name == 'HakutoWatch'
    watch_group_key = child
    break
  end
end

unless watch_group_key
  watch_group = main_group.new_group('HakutoWatch', 'watch-app')
  watch_group.path = File.join('..', 'watch-app')
  watch_group.source_tree = 'SOURCE_ROOT'

  # Add all .swift files from watch-app/ to the watch target
  Dir.glob(File.join(WATCH_APP_DIR, '*.swift')).sort.each do |swift_file|
    file_ref = watch_group.new_reference(swift_file)
    watch_target.source_build_phase.add_file_reference(file_ref)
  end
  ok "added Swift files from watch-app/"
end

# --- Add Embed Watch Content phase to iOS target ---
ios_target = project.targets.find { |t| t.name == 'Hakuto' }
fail!("iOS target 'Hakuto' not found") unless ios_target

embed_phase_name = 'Embed Watch Content'
existing_phase = ios_target.build_phases.find { |p| p.is_a?(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase) && p.name == embed_phase_name }
unless existing_phase
  embed_phase = ios_target.new_copy_files_build_phase(embed_phase_name)
  embed_phase.symbol_dst_subfolder_spec = :products_directory
  embed_phase.dst_path = '$(CONTENTS_FOLDER_PATH)/Watch'

  # Add watch app product reference to embed phase
  product_ref = watch_target.product_reference
  build_file = embed_phase.add_file_reference(product_ref)
  ok "added Embed Watch Content phase"
end

# --- Add dependency from iOS target to watch target ---
ios_target_dep = ios_target.dependency_for_target(watch_target)
unless ios_target_dep
  ios_target.add_dependency(watch_target)
  ok "added iOS → Watch target dependency"
end

# --- Save ---
project.save
ok "project saved with watchOS target '#{WATCH_TARGET_NAME}'"
