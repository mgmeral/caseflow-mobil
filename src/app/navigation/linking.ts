export const navigationLinking = {
  prefixes: ['caseflow://'],
  config: {
    screens: {
      AppTabs: {
        screens: {
          Home: 'home',
          CasesStack: {
            screens: {
              Cases: 'cases',
              CaseDetail: 'case/:caseId',
            },
          },
          Inbox: 'inbox',
          Customers: 'customers',
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      Login: 'login',
    },
  },
};
