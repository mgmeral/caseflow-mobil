import { fireEvent, render } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

jest.mock('../../core/auth/session', () => ({
  login: jest.fn(),
}));

describe('LoginScreen', () => {
  it('shows validation errors when fields are empty', async () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Sign In'));

    expect(getByText('Username and password are required.')).toBeTruthy();
  });
});
