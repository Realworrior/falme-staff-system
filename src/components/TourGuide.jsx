import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const TourGuide = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already taken the tour (persist across refreshes and tabs)
    const hasTakenTour = localStorage.getItem('falme_tour_completed');
    if (!hasTakenTour) {
      // Small delay to ensure the DOM is rendered
      const timer = setTimeout(() => setRun(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      content: 'Welcome to the Falme Staff System! Let\'s take a quick tour to help you navigate your new operational hub.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-nav-bar',
      content: 'This is your main navigation. Use it to switch between Dashboard, Templates, Tickets, Rota, and more.',
      placement: 'right',
    },
    {
      target: '.tour-dashboard-shortcuts',
      content: 'These shortcuts give you instant access to your most-used modules like Support Templates and Rota Management.',
      placement: 'bottom',
    },
    {
      target: '.tour-template-ai',
      content: 'Our Advanced AI Matcher! Paste any client message here, and the system will automatically detect the sentiment and suggest the best response template.',
      placement: 'bottom',
    },
    {
      target: '.tour-template-search',
      content: 'Looking for something specific? Use the filter to search through all available response categories instantly.',
      placement: 'top',
    },
    {
      target: '.tour-template-browse',
      content: 'Browse through our extensive library of response templates, organized by category for easy access.',
      placement: 'top',
    },
    {
      target: '.tour-type-standard',
      content: 'Standard (S): A direct, professional response ideal for general queries or neutral interactions.',
      placement: 'left',
    },
    {
      target: '.tour-type-empathy',
      content: 'High Empathy (H): Use this for distressed or frustrated clients. It uses softer language and acknowledges their feelings.',
      placement: 'left',
    },
    {
      target: '.tour-type-alt',
      content: 'Alternative (A): Specialized variants like "Official Decision" or "Shorter Version" for specific edge cases.',
      placement: 'left',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('falme_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          primaryColor: 'var(--accent)',
          backgroundColor: 'var(--card)',
          textColor: 'var(--foreground)',
          arrowColor: 'var(--card)',
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
        },
        buttonClose: {
          display: 'none',
        },
        buttonSkip: {
          color: 'var(--muted-foreground)',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        buttonNext: {
          backgroundColor: 'var(--accent)',
          fontWeight: '800',
          borderRadius: 8,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        buttonBack: {
          marginRight: 10,
          color: 'var(--foreground)',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        tooltip: {
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: '20px',
        },
      }}
    />
  );
};

export default TourGuide;
