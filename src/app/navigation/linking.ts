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
          CustomersStack: {
            screens: {
              Customers: 'customers',
              CustomerDetail: 'customer/:customerId',
            },
          },
          Notifications: 'notifications',
          ProfileStack: {
            screens: {
              Profile: 'profile',
              Reports: 'reports',
              Templates: 'admin/templates',
              Channels: 'admin/channels',
            },
          },
        },
      },
      Login: 'login',
    },
  },
};
