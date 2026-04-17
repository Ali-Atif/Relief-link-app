export type RootStackParamList = {
  Login: { prefilledEmail?: string };
  Register: undefined;
  RegisterUser: undefined;
  RegisterNgo: undefined;
  Home: undefined;
  NgoHome: undefined;
  Profile: undefined;
  Notifications: undefined;
  SOS: undefined;
  Contacts: undefined;
  AddContact: undefined;
  Report: undefined;
  Guides: undefined;
  GuideDetail: { guideId: string; title?: string };
  Quiz: undefined;
  Chat: {
    chatId: string;
    alertId: string;
    userId: string;
    ngoId: string;
    otherPersonName: string;
  };
};

export type AuthStackParamList = Pick<
  RootStackParamList,
  'Login' | 'Register' | 'RegisterUser' | 'RegisterNgo'
>;
