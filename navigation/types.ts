export type RootStackParamList = {
  Login: undefined;
  SelectRole: undefined;
  RegisterUser: undefined;
  RegisterNgo: undefined;
  Register: undefined;
  Home: undefined;
  SOS: undefined;
  Contacts: undefined;
  AddContact: undefined;
  Report: undefined;
  Guides: undefined;
  GuideDetail: { guideId: string; title?: string };
  Quiz: undefined;
};

export type AuthStackParamList = Pick<RootStackParamList, 'Login' | 'SelectRole' | 'RegisterUser' | 'RegisterNgo'>;
