import React, { useState } from "react";
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Play,
  FileCode,
  Folder,
  BookOpen,
} from "lucide-react";
import JSZip from "jszip";
import { flutterCodebase } from "../data/flutterTemplates";

interface FlutterSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterSuiteModal: React.FC<FlutterSuiteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState(flutterCodebase[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "build-guide">("simulator");
  const [simulatorNavTab, setSimulatorNavTab] = useState<"feed" | "jobs" | "messaging" | "profile">("feed");

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      flutterCodebase.forEach((f) => {
        zip.file(f.path, f.code);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "proconnect_flutter_mobile_app.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download zip error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 text-white rounded-2xl max-w-6xl w-full h-[90vh] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Flutter Unified Mobile App Suite</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-800">
                  Android APK & iOS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Single Flutter codebase for Android & iOS with interactive simulator and release build guide.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
            >
              <Folder className="w-4 h-4" />
              <span>{isZipping ? "Zipping..." : "Download Flutter Source (.ZIP)"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
              activeTab === "simulator"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Interactive Mobile Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
              activeTab === "code"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Flutter Code Inspector ({flutterCodebase.length} Files)</span>
          </button>

          <button
            onClick={() => setActiveTab("build-guide")}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
              activeTab === "build-guide"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>APK & iOS Build Instructions</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950">
          {/* TAB 1: Live Interactive Mobile Simulator */}
          {activeTab === "simulator" && (
            <div className="h-full flex flex-col md:flex-row items-center justify-center gap-8 overflow-y-auto">
              {/* Phone Frame Mockup */}
              <div className="w-[340px] h-[640px] bg-black rounded-[48px] p-3 border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-slate-600">
                {/* Dynamic Island / Notch */}
                <div className="w-28 h-5 bg-black rounded-b-xl mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-slate-900 rounded-full mr-2" />
                  <div className="w-2 h-2 bg-blue-900 rounded-full" />
                </div>

                {/* Simulated Device Screen */}
                <div className="w-full h-full bg-[#F4F2EE] text-slate-900 rounded-[36px] overflow-hidden flex flex-col pt-7 relative font-sans">
                  {/* App Bar */}
                  <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                    <div className="w-7 h-7 bg-[#0A66C2] text-white rounded-md font-black text-sm flex items-center justify-center">
                      in
                    </div>
                    <div className="flex-1 mx-2 bg-slate-100 rounded-md px-2 py-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <span>🔍 Search Flutter App...</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>

                  {/* Simulator Dynamic View Screen */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {simulatorNavTab === "feed" && (
                      <>
                        <div className="bg-white p-3 rounded-xl shadow-2xs space-y-2">
                          <div className="flex items-center gap-2">
                            <img
                              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100"
                              alt="A"
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-xs font-bold">Sophia Martinez</p>
                              <p className="text-[10px] text-slate-500">Principal AI Researcher</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-800">
                            🚀 Flutter + Gemini AI cross platform mobile builds running live on Android & iOS!
                          </p>
                          <img
                            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500"
                            alt="Img"
                            className="w-full h-28 object-cover rounded-lg"
                          />
                        </div>

                        <div className="bg-white p-3 rounded-xl shadow-2xs space-y-2">
                          <p className="text-xs font-bold text-slate-900">Marcus Vance</p>
                          <p className="text-[11px] text-slate-700">
                            Single Dart codebase reduces mobile development costs by 60%!
                          </p>
                        </div>
                      </>
                    )}

                    {simulatorNavTab === "jobs" && (
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-xl shadow-2xs">
                          <p className="font-bold text-xs">Senior Flutter Lead</p>
                          <p className="text-[10px] text-[#0A66C2]">MobileFirst Tech • Remote</p>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                            $180k - $220k
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-2xs">
                          <p className="font-bold text-xs">Full Stack AI Developer</p>
                          <p className="text-[10px] text-[#0A66C2]">InnovateAI Labs • Hybrid</p>
                        </div>
                      </div>
                    )}

                    {simulatorNavTab === "messaging" && (
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-xl flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            SM
                          </div>
                          <div>
                            <p className="text-xs font-bold">Sophia Martinez</p>
                            <p className="text-[10px] text-slate-500">Thanks for checking out the Flutter build!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {simulatorNavTab === "profile" && (
                      <div className="bg-white p-4 rounded-xl text-center space-y-2">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                          alt="Me"
                          className="w-16 h-16 rounded-full mx-auto"
                        />
                        <h4 className="font-bold text-xs">Alex Rivera</h4>
                        <p className="text-[10px] text-slate-500">
                          Senior Full Stack Architect | Flutter Developer
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Simulator Bottom Navigation */}
                  <div className="bg-white border-t border-slate-200 py-2 px-4 flex items-center justify-around text-[10px] font-bold text-slate-600">
                    <button
                      onClick={() => setSimulatorNavTab("feed")}
                      className={`flex flex-col items-center ${
                        simulatorNavTab === "feed" ? "text-[#0A66C2]" : ""
                      }`}
                    >
                      <span>🏠</span>
                      <span>Home</span>
                    </button>
                    <button
                      onClick={() => setSimulatorNavTab("jobs")}
                      className={`flex flex-col items-center ${
                        simulatorNavTab === "jobs" ? "text-[#0A66C2]" : ""
                      }`}
                    >
                      <span>💼</span>
                      <span>Jobs</span>
                    </button>
                    <button
                      onClick={() => setSimulatorNavTab("messaging")}
                      className={`flex flex-col items-center ${
                        simulatorNavTab === "messaging" ? "text-[#0A66C2]" : ""
                      }`}
                    >
                      <span>💬</span>
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => setSimulatorNavTab("profile")}
                      className={`flex flex-col items-center ${
                        simulatorNavTab === "profile" ? "text-[#0A66C2]" : ""
                      }`}
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulator Info Side Box */}
              <div className="max-w-md space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="font-extrabold text-sm text-cyan-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Cross-Platform Flutter Architecture</span>
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    This interactive mobile view demonstrates the Dart UI running synchronously with your ProConnect web app logic.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Android APK Release Compilation (`flutter build apk`)</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>iOS App Bundle (`flutter build ipa`)</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Material 3 Design & Material You Colors</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Flutter Code Inspector */}
          {activeTab === "code" && (
            <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left File Selector */}
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Flutter Project Files
                </p>
                {flutterCodebase.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      selectedFile.path === file.path
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <FileCode className="w-3.5 h-3.5 shrink-0 ml-1" />
                  </button>
                ))}
              </div>

              {/* Right Code Display */}
              <div className="md:col-span-9 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {selectedFile.title}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-slate-200 leading-relaxed bg-slate-950/60">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: APK & iOS Build Instructions */}
          {activeTab === "build-guide" && (
            <div className="h-full overflow-y-auto max-w-3xl mx-auto space-y-6 text-xs text-slate-300">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>Step-by-Step Android APK & iOS Compilation Guide</span>
                </h3>
                <p className="text-slate-400">
                  Follow these instructions on your local computer to compile the downloaded Flutter code into a standalone Android `.apk` or iOS `.ipa`.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm">
                  1. Unzip & Fetch Flutter Dependencies
                </h4>
                <p>Extract `proconnect_flutter_mobile_app.zip` and run:</p>
                <div className="p-3 bg-black rounded-lg font-mono text-emerald-400 text-xs">
                  flutter pub get
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm">
                  2. Build Release Android APK (`.apk`)
                </h4>
                <p>To produce a standalone `.apk` for direct installation on Android devices:</p>
                <div className="p-3 bg-black rounded-lg font-mono text-emerald-400 text-xs">
                  flutter build apk --release
                </div>
                <p className="text-[11px] text-slate-400">
                  Generated file location: `build/app/outputs/flutter-apk/app-release.apk`
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm">
                  3. Build Google Play Store App Bundle (`.aab`)
                </h4>
                <div className="p-3 bg-black rounded-lg font-mono text-emerald-400 text-xs">
                  flutter build appbundle --release
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm">
                  4. Build iOS App (`.ipa` for App Store)
                </h4>
                <p>On macOS with Xcode installed, run:</p>
                <div className="p-3 bg-black rounded-lg font-mono text-emerald-400 text-xs">
                  flutter build ipa --release --no-codesign
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
