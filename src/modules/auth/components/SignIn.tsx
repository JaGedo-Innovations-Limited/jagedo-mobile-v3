import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AuthMode = 'otp' | 'password';
const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 58;

const SignIn = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const trimmedIdentifier = identifier.trim();
  const numericIdentifier = trimmedIdentifier.replace(/\D/g, '');
  const isValidPhone = /^(07|01)\d{8}$/.test(numericIdentifier);
  const isValidEmail = /\S+@\S+\.\S+/.test(trimmedIdentifier);
  const isIdentifierValid = isValidPhone || isValidEmail;
  const hasIdentifier = trimmedIdentifier.length > 0;
  const isOtpComplete = otpDigits.every((digit) => digit.length === 1);
  const isPasswordReady =
    authMode === 'password' && isIdentifierValid && password.trim().length > 0;
  const isOtpReady = authMode === 'otp' && otpSent && isOtpComplete;
  const isSignInEnabled = isOtpReady || isPasswordReady;

  useEffect(() => {
    if (!otpSent || countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  useEffect(() => {
    setOtpSent(false);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(OTP_RESEND_SECONDS);
  }, [authMode]);

  useEffect(() => {
    if (otpSent) {
      const focusTimer = setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [otpSent]);

  const handleSendCode = () => {
    if (!isIdentifierValid) {
      return;
    }

    setOtpSent(true);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(OTP_RESEND_SECONDS);
  };

  const handleEditIdentifier = () => {
    setOtpSent(false);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(OTP_RESEND_SECONDS);
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanedValue = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanedValue;
    setOtpDigits(nextDigits);

    if (cleanedValue && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (
    key: string,
    index: number,
  ) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !isIdentifierValid) {
      return;
    }

    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(OTP_RESEND_SECONDS);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(1, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../../assets/jagedo-logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Sign in to your account</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to access your account
            </Text>
          </View>

          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tabButton,
                authMode === 'otp' && styles.tabButtonActive,
              ]}
              onPress={() => setAuthMode('otp')}
            >
              <Text
                style={[
                  styles.tabText,
                  authMode === 'otp' && styles.tabTextActive,
                ]}
              >
                OTP Sign In
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                authMode === 'password' && styles.tabButtonActive,
              ]}
              onPress={() => setAuthMode('password')}
            >
              <Text
                style={[
                  styles.tabText,
                  authMode === 'password' && styles.tabTextActive,
                ]}
              >
                Password Sign In
              </Text>
            </Pressable>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Email or Phone Number</Text>
            {authMode === 'otp' ? (
              <View style={styles.inputRow}>
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="name@example.com or +12345678"
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.input,
                    isIdentifierValid && !otpSent && styles.inputActive,
                    otpSent && styles.inputLocked,
                  ]}
                  keyboardType={isValidEmail ? 'email-address' : 'default'}
                  autoCapitalize="none"
                  selectionColor="#2563EB"
                  editable={!otpSent}
                />
                <Pressable
                  style={[
                    styles.codeButton,
                    hasIdentifier && styles.codeButtonHighlighted,
                    isIdentifierValid && styles.codeButtonEnabled,
                  ]}
                  onPress={otpSent ? handleEditIdentifier : handleSendCode}
                  disabled={!otpSent && !isIdentifierValid}
                >
                  <Text style={styles.codeButtonText}>
                    {otpSent ? 'Edit' : 'Get Code'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="name@example.com or +1234567890"
                placeholderTextColor="#94A3B8"
                style={[styles.inputFull, isIdentifierValid && styles.inputActive]}
                keyboardType={isValidEmail ? 'email-address' : 'default'}
                autoCapitalize="none"
                selectionColor="#2563EB"
              />
            )}

            {authMode === 'otp' && otpSent && (
              <>
                <Text style={styles.label}>Enter 6-digit OTP</Text>
                <View style={styles.otpRow}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={`otp-${index}`}
                      ref={(ref) => {
                        otpRefs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(nativeEvent.key, index)
                      }
                      style={[
                        styles.otpInput,
                        digit.length === 1 && styles.otpInputActive,
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectionColor="#2563EB"
                    />
                  ))}
                </View>

                {countdown > 0 ? (
                  <Text style={styles.helperText}>
                    {"Didn't receive OTP? You can resend in "}
                    {formatCountdown(countdown)}
                  </Text>
                ) : (
                  <Pressable onPress={handleResendOtp}>
                    <Text style={styles.helperLink}>{"Didn't receive OTP? Resend OTP"}</Text>
                  </Pressable>
                )}
              </>
            )}

            {authMode === 'password' && (
              <>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  style={styles.inputFull}
                  secureTextEntry
                  autoCapitalize="none"
                  selectionColor="#2563EB"
                />
              </>
            )}

            <Pressable
              style={[
                styles.signInButton,
                isSignInEnabled && styles.signInButtonEnabled,
              ]}
              disabled={!isSignInEnabled}
              onPress={() => {
                if (isSignInEnabled) {
                  router.replace('/role-selection');
                }
              }}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <Pressable style={styles.googleButton}>
            <MaterialCommunityIcons name="google" size={24} color="#ea4335" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 52,
    borderRadius: 14,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 28,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  formSection: {
    gap: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 58,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  inputLocked: {
    backgroundColor: '#F3F4F6',
  },
  inputFull: {
    width: '100%',
    height: 58,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  codeButton: {
    minWidth: 118,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  codeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  codeButtonHighlighted: {
    backgroundColor: '#60A5FA',
  },
  codeButtonEnabled: {
    backgroundColor: '#2563EB',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    width: 56,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    fontSize: 22,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  otpInputActive: {
    borderColor: '#2563EB',
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
  },
  helperLink: {
    fontSize: 14,
    color: '#2563EB',
  },
  signInButton: {
    height: 58,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signInButtonEnabled: {
    backgroundColor: '#2563EB',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7DDE7',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748B',
  },
  googleButton: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  googleMark: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EA4335',
    lineHeight: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
});
