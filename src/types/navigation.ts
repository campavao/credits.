export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/login': undefined;
  '(auth)/verify': { email: string };
  'title/[id]': { id: number; mediaType: 'movie' | 'tv' };
  'actor/[id]': { id: number };
  'actor/[id]/swipe': { id: number };
  'friend/[id]': { id: string };
};
