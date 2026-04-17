import { CommonActions } from '@react-navigation/native';

/** Clears the stack and shows Home — use for “Back to Home” so users always land on the main page. */
export function dispatchResetToHome(
  dispatch: (action: ReturnType<typeof CommonActions.reset>) => void,
  isNgo = false,
) {
  dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: isNgo ? 'NgoHome' : 'Home' }],
    }),
  );
}
