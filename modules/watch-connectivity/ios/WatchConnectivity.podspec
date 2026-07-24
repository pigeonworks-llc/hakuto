Pod::Spec.new do |s|
  s.name = "HakutoWatchKit"
  s.version = "1.0.0"
  s.summary = "WatchConnectivity wrapper module for Hakuto"
  s.homepage = "https://github.com/pigeonworks-llc/hakuto"
  s.license = "MIT"
  s.author = "Pigeonworks LLC"
  s.source = { :git => "https://github.com/pigeonworks-llc/hakuto.git" }
  s.platform = :ios, "16.0"
  s.swift_version = "5.4"
  s.source_files = "**/*.swift"
  s.dependency "ExpoModulesCore"
end
