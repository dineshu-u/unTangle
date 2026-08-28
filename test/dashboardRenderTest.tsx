import React from 'react';
import { renderToString } from 'react-dom/server';
import { AppProvider, useApp } from '../src/context/AppContext';
import { ParentDashboardView } from '../src/features/parent/ParentDashboardView';

function TestWrapper({ lang, dyslexic }: { lang: 'en' | 'ta'; dyslexic: boolean }) {
  const { setLanguage, setUseDyslexicFont, setAppMode } = useApp();
  React.useEffect(() => {
    setLanguage(lang);
    setUseDyslexicFont(dyslexic);
    setAppMode('parent');
  }, [lang, dyslexic]);
  return <ParentDashboardView />;
}

try {
  console.log('Testing ParentDashboardView with English + Dyslexic Font...');
  const htmlEnDyslexic = renderToString(
    <AppProvider>
      <TestWrapper lang="en" dyslexic={true} />
    </AppProvider>
  );
  console.log('PASS: English + Dyslexic Font rendered successfully! Length:', htmlEnDyslexic.length);

  console.log('Testing ParentDashboardView with Tamil + Dyslexic Font...');
  const htmlTaDyslexic = renderToString(
    <AppProvider>
      <TestWrapper lang="ta" dyslexic={true} />
    </AppProvider>
  );
  console.log('PASS: Tamil + Dyslexic Font rendered successfully! Length:', htmlTaDyslexic.length);

  console.log('Testing ParentDashboardView with English + Standard Font...');
  const htmlEnStd = renderToString(
    <AppProvider>
      <TestWrapper lang="en" dyslexic={false} />
    </AppProvider>
  );
  console.log('PASS: English + Standard Font rendered successfully! Length:', htmlEnStd.length);

  console.log('Testing ParentDashboardView with Tamil + Standard Font...');
  const htmlTaStd = renderToString(
    <AppProvider>
      <TestWrapper lang="ta" dyslexic={false} />
    </AppProvider>
  );
  console.log('PASS: Tamil + Standard Font rendered successfully! Length:', htmlTaStd.length);

  console.log('\n=== ALL PARENT DASHBOARD RENDER TESTS PASSED! ===');
} catch (err) {
  console.error('FAIL ParentDashboardView render error:', err);
  process.exit(1);
}
