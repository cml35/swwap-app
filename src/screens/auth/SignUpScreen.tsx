import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { signUpSchema, type SignUpInput } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

type SignUpScreenNavigationProp = NativeStackNavigationProp<any, 'SignUp'>;

export const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { login } = useAuth();

  const signUpMutation = useMutation({
    mutationFn: authService.signUp,
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      login(data)
        .then(() => {
          console.log('Sign up successful');
        })
        .catch((error) => {
          console.error('Login after signup failed:', error);
          Alert.alert('Error', 'Failed to save authentication data');
        });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      Alert.alert('Error', error.message || 'Failed to sign up. Please try again.');
    },
  });

  const validateForm = (): boolean => {
    console.log('Validating form with:', { email, password, confirmPassword, firstName, lastName });
    try {
      signUpSchema.parse({ email, password, confirmPassword, firstName, lastName });
      setValidationErrors({});
      return true;
    } catch (error: any) {
      console.log('Validation errors:', error.errors);
      const newErrors: { email?: string; password?: string; confirmPassword?: string; firstName?: string; lastName?: string } = {};
      error.errors.forEach((err: any) => {
        const path = err.path[0] as 'email' | 'password' | 'confirmPassword' | 'firstName' | 'lastName';
        if (!newErrors[path]) {
          newErrors[path] = err.message;
        }
      });
      setValidationErrors(newErrors);
      return false;
    }
  };

  const handleSignUp = async () => {
    console.log('Sign up button pressed');
    console.log('Current form state:', { email, password, confirmPassword, firstName, lastName });
    
    if (!validateForm()) {
      console.log('Form validation failed:', validationErrors);
      return;
    }
    
    console.log('Form validation passed, submitting...');
    try {
      await signUpMutation.mutateAsync({ email, password, confirmPassword, firstName, lastName });
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.firstName && styles.inputError]}
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (validationErrors.firstName) {
                setValidationErrors(prev => ({ ...prev, firstName: undefined }));
              }
            }}
            autoCapitalize="words"
            editable={!signUpMutation.isPending}
          />
          {validationErrors.firstName && (
            <Text style={styles.errorText}>{validationErrors.firstName}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.lastName && styles.inputError]}
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (validationErrors.lastName) {
                setValidationErrors(prev => ({ ...prev, lastName: undefined }));
              }
            }}
            autoCapitalize="words"
            editable={!signUpMutation.isPending}
          />
          {validationErrors.lastName && (
            <Text style={styles.errorText}>{validationErrors.lastName}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.email && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: undefined }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!signUpMutation.isPending}
          />
          {validationErrors.email && (
            <Text style={styles.errorText}>{validationErrors.email}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.password && styles.inputError]}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (validationErrors.password) {
                setValidationErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            editable={!signUpMutation.isPending}
          />
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.confirmPassword && styles.inputError]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (validationErrors.confirmPassword) {
                setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            editable={!signUpMutation.isPending}
          />
          {validationErrors.confirmPassword && (
            <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, signUpMutation.isPending && styles.buttonDisabled]}
          onPress={() => {
            console.log('Button pressed');
            handleSignUp();
          }}
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink} 
          onPress={handleLoginPress}
          disabled={signUpMutation.isPending}
        >
          <Text style={styles.loginText}>
            Already have an account? Login here
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 