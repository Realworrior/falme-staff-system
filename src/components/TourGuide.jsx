import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const TourGuide = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already taken the tour in this session
    const hasTakenTour = sessionStorage.getItem('falme_tour_completed');
    if (!hasTakenTour) {
      // Small delay to ensure the DOM is rendered
      setTimeout(() => setRun(true), 1500);
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
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      sessionStorage.setItem('falme_tour_completed', 'true');
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
          primaryColor: '#f97316',
          backgroundColor: '#16161f',
          textColor: '#e8eaf0',
          arrowColor: '#16161f',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        buttonClose: {
          display: 'none',
        },
        buttonSkip: {
          color: '#8b93a7',
        },
        buttonNext: {
          backgroundColor: '#f97316',
          fontWeight: 'bold',
          borderRadius: 8,
        },
        buttonBack: {
          marginRight: 10,
          color: '#eab308'
        },
        tooltip: {
          borderRadius: 16,
          border: '1px solid #2e2e42',
        },
      }}
    />
  );
};

export default TourGuide;
