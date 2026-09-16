import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // App Header & Branding
    orgName: 'ETASHA Society',
    appTitle: 'SkillSetu',
    appTagline: 'Empowering Underprivileged Youth with Soft Skills & Career Readiness',
    motto: 'Transforming mindsets, building sustainable careers',
    pwaInstall: 'Install App',
    installed: 'App Installed',
    online: 'Online',
    offline: 'Offline Mode',
    lowData: 'Low Data Mode',

    // Role Labels
    roleLearner: 'Learner / Trainee',
    roleLearnerDesc: 'Slum youth & young adults building workplace skills',
    roleTrainer: 'Trainer / Facilitator',
    roleTrainerDesc: 'CDC faculty tracking milestones & student cohorts',
    roleEmployer: 'Employer Partner',
    roleEmployerDesc: 'Hiring corporate partners discovering job-ready talent',
    roleAdmin: 'Impact & Leadership',
    roleAdminDesc: 'ETASHA leadership, M&E & CSR donors',

    // Login & Register Form
    welcomeBack: 'Welcome Back',
    welcomeSub: 'Login to your ETASHA SkillSetu learning & career portal',
    createNewAccount: 'Register New Trainee / User',
    registerSub: 'Join ETASHA’s transformative training program today',
    tabLogin: 'Sign In',
    tabRegister: 'Register',
    
    // Form Fields
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your complete name (e.g. Pooja Kumari)',
    identifier: 'Email or Mobile Number',
    identifierPlaceholder: 'e.g. 9876543210 or name@etasha.org',
    email: 'Email Address',
    emailPlaceholder: 'name@etasha.org',
    phone: 'Mobile Number',
    phonePlaceholder: '10-digit mobile number',
    password: 'Password',
    passwordPlaceholder: 'Enter your password (min 6 chars)',
    center: 'Community Development Center (CDC)',
    centerPlaceholder: 'Select your center',
    organization: 'Company / Organization Name',
    organizationPlaceholder: 'e.g. Apex Retail Services',
    batch: 'Batch / Course',
    selectRole: 'Select Your Role',

    // Buttons
    btnSignIn: 'Sign In to Portal',
    btnRegister: 'Create My Account',
    btnSigningIn: 'Signing in...',
    btnRegistering: 'Creating Account...',
    quickDemoTitle: 'Quick Demo Access (One-Click Login):',
    demoLearner: 'Learner (Pooja)',
    demoTrainer: 'Trainer (Sunita)',
    demoEmployer: 'Employer (Apex Retail)',
    demoAdmin: 'Impact Team (Admin)',
    
    // Centers
    centerSangamVihar: 'Sangam Vihar CDC',
    centerKhanpur: 'Khanpur CDC',
    centerDakshinpuri: 'Dakshinpuri CDC',
    centerMangolpuri: 'Mangolpuri CDC',
    centerPartner: 'Partner ITI / WCSC / Other',
    centerHQ: 'Central HQ (Delhi)',

    // Audio & Accessibility
    audioGuidance: 'Listen in Hindi',
    audioTooltip: 'Audio instructions for first-time digital users',

    // Dashboard / Success Strings
    hello: 'Hello',
    traineeId: 'Trainee ID',
    centerLabel: 'Center',
    batchLabel: 'Batch',
    softSkillsProgress: 'Soft Skills Readiness',
    confidenceScore: 'Confidence & Mindset',
    communicationScore: 'Spoken English & Communication',
    workplaceEtiquette: 'Workplace Ethics & Behavior',
    interviewReadiness: 'Interview Readiness Score',
    badgesEarned: 'Badges Earned',
    attendance: 'Attendance',
    mockInterviews: 'Mock Interviews',
    startMockInterview: 'Start AI Mock Interview',
    startMockInterviewSub: 'Practice retail & customer service interview questions with instant AI feedback',
    dailyConfidenceCheckin: 'Daily Confidence Check-in',
    howFeelingToday: 'How confident do you feel about speaking English today?',
    great: 'Very Confident 🌟',
    good: 'Good 👍',
    needPractice: 'Need Practice 💪',
    offlineResources: 'Bite-Sized Offline Lessons',
    lesson1: '1. Professional Self-Introduction (30-Sec Pitch)',
    lesson2: '2. Positive Body Language & Eye Contact',
    lesson3: '3. Handling Customer Inquiries with Courtesy',
    logout: 'Sign Out',
    switchRole: 'Switch Role',

    // Validation & Messages
    fillRequired: 'Please fill in all required fields.',
    loginSuccess: 'Login successful! Welcome back.',
    regSuccess: 'Registration successful! Your journey begins.',
    authFailed: 'Authentication failed. Please check your credentials.',
  },

  hi: {
    // App Header & Branding
    orgName: 'इताशा सोसाइटी (ETASHA)',
    appTitle: 'कौशल सेतु',
    appTagline: 'वंचित युवाओं और महिलाओं के लिए सॉफ्ट स्किल्स और करियर की तैयारी का मंच',
    motto: 'हुनर से आत्मनिर्भरता और सम्मान की ओर',
    pwaInstall: 'ऐप इंस्टॉल करें',
    installed: 'ऐप इंस्टॉल है',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन मोड',
    lowData: 'लो-डेटा मोड',

    // Role Labels
    roleLearner: 'शिक्षार्थी / युवा (Learner)',
    roleLearnerDesc: 'रोजगार के लिए सॉफ्ट स्किल्स और आत्मविश्वास सीखने वाले छात्र',
    roleTrainer: 'प्रशिक्षक (Trainer)',
    roleTrainerDesc: 'कौशल केंद्र के शिक्षक जो छात्रों की प्रगति देखते हैं',
    roleEmployer: 'नियोक्ता (Employer)',
    roleEmployerDesc: 'नौकरी देने वाली कंपनियां और भर्ती साझेदार',
    roleAdmin: 'प्रबंधन एवं इम्पैक्ट टीम',
    roleAdminDesc: 'इताशा नेतृत्व, सीएसआर (CSR) और संस्थागत रिपोर्टिंग',

    // Login & Register Form
    welcomeBack: 'कौशल सेतु में आपका स्वागत है',
    welcomeSub: 'अपने इताशा सीखने और करियर पोर्टल में लॉग इन करें',
    createNewAccount: 'नया पंजीकरण करें (रजिस्टर)',
    registerSub: 'इताशा के रोजगार प्रशिक्षण कार्यक्रम से आज ही जुड़ें',
    tabLogin: 'लॉग इन करें',
    tabRegister: 'नया खाता बनाएं',
    
    // Form Fields
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम लिखें (उदा. पूजा कुमारी)',
    identifier: 'मोबाइल नंबर या ईमेल',
    identifierPlaceholder: 'उदा. 9876543210 या नाम@etasha.org',
    email: 'ईमेल पता',
    emailPlaceholder: 'name@etasha.org',
    phone: 'मोबाइल नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें (कम से कम 6 अक्षर)',
    center: 'सामुदायिक विकास केंद्र (CDC)',
    centerPlaceholder: 'अपना कौशल केंद्र चुनें',
    organization: 'कंपनी या संस्था का नाम',
    organizationPlaceholder: 'उदा. एपेक्स रिटेल सर्विसेज',
    batch: 'बैच / कोर्स',
    selectRole: 'अपनी भूमिका चुनें',

    // Buttons
    btnSignIn: 'पोर्टल में प्रवेश करें (लॉग इन)',
    btnRegister: 'खाता बनाएं (पंजीकरण)',
    btnSigningIn: 'प्रवेश हो रहा है...',
    btnRegistering: 'खाता बन रहा है...',
    quickDemoTitle: 'त्वरित डेमो परीक्षण (एक क्लिक में लॉग इन):',
    demoLearner: 'शिक्षार्थी (पूजा)',
    demoTrainer: 'प्रशिक्षक (सुनीता)',
    demoEmployer: 'नियोक्ता (राजेश)',
    demoAdmin: 'प्रबंधन टीम (एडमिन)',
    
    // Centers
    centerSangamVihar: 'संगम विहार केंद्र (CDC)',
    centerKhanpur: 'खानपुर केंद्र (CDC)',
    centerDakshinpuri: 'दक्षिणपुरी केंद्र (CDC)',
    centerMangolpuri: 'मंगोलपुरी केंद्र (CDC)',
    centerPartner: 'पार्टनर ITI / WCSC / अन्य',
    centerHQ: 'केंद्रीय मुख्यालय (दिल्ली)',

    // Audio & Accessibility
    audioGuidance: 'हिन्दी में आवाज सुनें',
    audioTooltip: 'पहली बार डिजिटल उपयोग करने वालों के लिए ध्वनि निर्देश',

    // Dashboard / Success Strings
    hello: 'नमस्ते',
    traineeId: 'ट्रेनी आईडी',
    centerLabel: 'केंद्र',
    batchLabel: 'बैच',
    softSkillsProgress: 'सॉफ्ट स्किल्स तत्परता (Readiness)',
    confidenceScore: 'आत्मविश्वास व सकारात्मक सोच',
    communicationScore: 'अंग्रेजी व संवाद क्षमता',
    workplaceEtiquette: 'कार्यस्थल आचरण एवं शिष्टाचार',
    interviewReadiness: 'साक्षात्कार (इंटरव्यू) तैयारी स्कोर',
    badgesEarned: 'प्राप्त बैज',
    attendance: 'उपस्थिति',
    mockInterviews: 'मॉक इंटरव्यू',
    startMockInterview: 'AI मॉक इंटरव्यू अभ्यास शुरू करें',
    startMockInterviewSub: 'रिटेल और कस्टमर सर्विस के सवालों का अभ्यास करें और तुरंत AI फीडबैक पाएं',
    dailyConfidenceCheckin: 'दैनिक आत्मविश्वास चेक-इन',
    howFeelingToday: 'आज आप अंग्रेजी बोलने में कितना आत्मविश्वासी महसूस कर रहे हैं?',
    great: 'बहुत आत्मविश्वासी 🌟',
    good: 'अच्छा 👍',
    needPractice: 'और अभ्यास चाहिए 💪',
    offlineResources: 'छोटे ऑफ़लाइन पाठ (Lessons)',
    lesson1: '1. पेशेवर आत्म-परिचय (30 सेकंड का पिच)',
    lesson2: '2. सही बॉडी लैंग्वेज और आंखों का संपर्क',
    lesson3: '3. ग्राहकों से विनम्रतापूर्वक बात करना',
    logout: 'लॉग आउट',
    switchRole: 'भूमिका बदलें',

    // Validation & Messages
    fillRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    loginSuccess: 'सफलतापूर्वक लॉग इन किया गया! स्वागत है।',
    regSuccess: 'पंजीकरण सफल! आपकी सीखने की यात्रा शुरू होती है।',
    authFailed: 'लॉग इन विफल। कृपया सही मोबाइल/ईमेल और पासवर्ड दर्ज करें।',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('etasha_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('etasha_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
