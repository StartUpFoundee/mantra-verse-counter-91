
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileManager from "@/components/ProfileManager";
import ModernCard from "@/components/ModernCard";

const IdentityGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
        <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Identity System Guide</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileManager />
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="english" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-amber-200/50 dark:border-zinc-700/50">
              <TabsTrigger 
                value="english"
                onClick={() => setLanguage("english")}
                className={`text-base lg:text-lg ${language === "english" ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white" : ""}`}
              >
                English
              </TabsTrigger>
              <TabsTrigger 
                value="hindi"
                onClick={() => setLanguage("hindi")}
                className={`text-base lg:text-lg ${language === "hindi" ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white" : ""}`}
              >
                हिन्दी (Hindi)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="english" className="mt-6">
              <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
                <div className="space-y-6 lg:space-y-8">
                  <section>
                    <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-4">Advanced Identity Management System</h2>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Overview</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-base lg:text-lg leading-relaxed">
                      Our new identity system provides secure, multi-account management with device fingerprinting 
                      and QR-based account transfer capabilities. Each device supports exactly 3 accounts with 
                      seamless synchronization across browser tabs.
                    </p>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Key Features</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>3 Account Slots:</strong> Each device can store exactly 3 user accounts</li>
                      <li><strong>Device Fingerprinting:</strong> Advanced 12+ method device identification</li>
                      <li><strong>QR Transfer:</strong> Export and import accounts between devices</li>
                      <li><strong>Cross-Tab Sync:</strong> Account data syncs across all browser tabs</li>
                      <li><strong>Secure Storage:</strong> Encrypted data with device-specific keys</li>
                      <li><strong>Password Protection:</strong> Each account secured with encrypted passwords</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Account Creation Process</h3>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Choose an empty account slot (1, 2, or 3)</li>
                      <li>Enter your name and date of birth</li>
                      <li>Create a secure password</li>
                      <li>System generates unique ID with device fingerprint</li>
                      <li>Account is encrypted and stored locally</li>
                      <li>Automatic login after creation</li>
                    </ol>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Device Fingerprinting Technology</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">Our system uses multiple fingerprinting methods:</p>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Screen resolution, color depth, and pixel ratio</li>
                      <li>Browser information and installed plugins</li>
                      <li>Canvas and WebGL rendering signatures</li>
                      <li>Audio context fingerprinting</li>
                      <li>Hardware specifications (CPU, memory)</li>
                      <li>Font availability and rendering</li>
                      <li>Timezone and locale settings</li>
                      <li>Touch and input device capabilities</li>
                      <li>Network and battery information (when available)</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">QR Code Account Transfer</h3>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">Exporting Your Account:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Click your profile avatar in the top-right corner</li>
                      <li>Select "Export QR Code" from the dropdown menu</li>
                      <li>A QR code will be generated containing your encrypted account data</li>
                      <li>Use "Refresh" to update the QR with latest data</li>
                      <li>Use "Download" to save the QR code image</li>
                      <li>QR codes expire after 24 hours for security</li>
                    </ol>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">Importing an Account:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Go to the account selection screen</li>
                      <li>Click "Import Account from QR" button</li>
                      <li>Choose an available account slot</li>
                      <li>Paste the QR code data or scan using camera (coming soon)</li>
                      <li>Account will be decrypted and imported to the selected slot</li>
                      <li>Login with your original password</li>
                    </ol>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Security & Privacy</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>Local Storage:</strong> All data stored locally on your device</li>
                      <li><strong>Encryption:</strong> Account data encrypted using device-specific keys</li>
                      <li><strong>No Server Storage:</strong> No data sent to external servers</li>
                      <li><strong>Password Security:</strong> Passwords hashed with device fingerprint salt</li>
                      <li><strong>Cross-Tab Security:</strong> Secure synchronization using BroadcastChannel</li>
                      <li><strong>QR Expiration:</strong> Transfer QR codes expire for security</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Account Management</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>Login Protection:</strong> 3 failed attempts trigger temporary lockout</li>
                      <li><strong>Account Switching:</strong> Easy switching between your 3 accounts</li>
                      <li><strong>Logout Security:</strong> Returns to account selection, clears session</li>
                      <li><strong>Data Persistence:</strong> Accounts persist across browser restarts</li>
                      <li><strong>Profile Management:</strong> View account details, copy ID, export QR</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Troubleshooting</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">Common issues and solutions:</p>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>Accounts not showing across tabs:</strong> Clear browser cache and reload</li>
                      <li><strong>Failed QR import:</strong> Ensure QR data is complete and not expired</li>
                      <li><strong>Login lockout:</strong> Wait 5 minutes for automatic unlock</li>
                      <li><strong>Account slots full:</strong> Remove an account to free up space</li>
                      <li><strong>Device fingerprint issues:</strong> Try clearing fingerprint cache</li>
                    </ul>
                  </section>
                </div>
              </ModernCard>
            </TabsContent>
            
            <TabsContent value="hindi" className="mt-6">
              <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
                <div className="space-y-6 lg:space-y-8">
                  <section>
                    <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-4">उन्नत पहचान प्रबंधन प्रणाली</h2>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">अवलोकन</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-base lg:text-lg leading-relaxed">
                      हमारी नई पहचान प्रणाली डिवाइस फिंगरप्रिंटिंग और QR-आधारित खाता स्थानांतरण क्षमताओं के साथ 
                      सुरक्षित, बहु-खाता प्रबंधन प्रदान करती है। प्रत्येक डिवाइस ब्राउज़र टैब्स में निर्बाध 
                      सिंक्रोनाइज़ेशन के साथ बिल्कुल 3 खातों का समर्थन करता है।
                    </p>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">मुख्य विशेषताएं</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>3 खाता स्लॉट:</strong> प्रत्येक डिवाइस बिल्कुल 3 उपयोगकर्ता खाते संग्रहीत कर सकता है</li>
                      <li><strong>डिवाइस फिंगरप्रिंटिंग:</strong> उन्नत 12+ विधि डिवाइस पहचान</li>
                      <li><strong>QR स्थानांतरण:</strong> डिवाइसेस के बीच खातों का निर्यात और आयात</li>
                      <li><strong>क्रॉस-टैब सिंक:</strong> सभी ब्राउज़र टैब्स में खाता डेटा सिंक</li>
                      <li><strong>सुरक्षित भंडारण:</strong> डिवाइस-विशिष्ट कुंजियों के साथ एन्क्रिप्टेड डेटा</li>
                      <li><strong>पासवर्ड सुरक्षा:</strong> एन्क्रिप्टेड पासवर्ड के साथ प्रत्येक खाता सुरक्षित</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">खाता निर्माण प्रक्रिया</h3>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>एक खाली खाता स्लॉट (1, 2, या 3) चुनें</li>
                      <li>अपना नाम और जन्म तिथि दर्ज करें</li>
                      <li>एक सुरक्षित पासवर्ड बनाएं</li>
                      <li>सिस्टम डिवाइस फिंगरप्रिंट के साथ अनूठी आईडी उत्पन्न करता है</li>
                      <li>खाता एन्क्रिप्ट किया जाता है और स्थानीय रूप से संग्रहीत किया जाता है</li>
                      <li>निर्माण के बाद स्वचालित लॉगिन</li>
                    </ol>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">QR कोड खाता स्थानांतरण</h3>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">अपना खाता निर्यात करना:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>ऊपरी-दाएं कोने में अपने प्रोफ़ाइल अवतार पर क्लिक करें</li>
                      <li>ड्रॉपडाउन मेनू से "Export QR Code" चुनें</li>
                      <li>आपके एन्क्रिप्टेड खाता डेटा वाला QR कोड उत्पन्न होगा</li>
                      <li>नवीनतम डेटा के साथ QR अपडेट करने के लिए "Refresh" का उपयोग करें</li>
                      <li>QR कोड छवि सहेजने के लिए "Download" का उपयोग करें</li>
                      <li>सुरक्षा के लिए QR कोड 24 घंटे बाद समाप्त हो जाते हैं</li>
                    </ol>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">सुरक्षा और गोपनीयता</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li><strong>स्थानीय भंडारण:</strong> सभी डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत</li>
                      <li><strong>एन्क्रिप्शन:</strong> डिवाइस-विशिष्ट कुंजियों का उपयोग करके खाता डेटा एन्क्रिप्टेड</li>
                      <li><strong>कोई सर्वर भंडारण नहीं:</strong> बाहरी सर्वर को कोई डेटा नहीं भेजा जाता</li>
                      <li><strong>पासवर्ड सुरक्षा:</strong> डिवाइस फिंगरप्रिंट सॉल्ट के साथ पासवर्ड हैश</li>
                      <li><strong>QR समाप्ति:</strong> सुरक्षा के लिए स्थानांतरण QR कोड समाप्त हो जाते हैं</li>
                    </ul>
                  </section>
                </div>
              </ModernCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default IdentityGuidePage;
