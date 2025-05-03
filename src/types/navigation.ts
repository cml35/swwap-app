export type RootStackParamList = {
  // Auth routes
  Login: undefined;
  SignUp: undefined;
  
  // Main app routes
  Main: undefined;
  ProfileListings: undefined;
  ListingDetails: {
    listingId: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Add: undefined;
  Messages: undefined;
  Profile: undefined;
}; 