import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { theme } from '../../styles/theme';

/**
 * Enterprise CustomInput Component (M3 & WCAG AA Compliant)
 * Accessible contrast (#CBD5E1 labels, #F3F4F6 text, #94A3B8 placeholders),
 * 52px touch target height, clear error validation styling, and focus states.
 */
export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  style,
  inputStyle,
  icon,
  editable = true,
  autoComplete,
  textContentType,
  importantForAutofill = 'yes',
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);
  const inputRef = useRef(null);

  const handleWrapperPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label (High WCAG AA Contrast) */}
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Input wrapper with press handling */}
      <Pressable
        onPress={handleWrapperPress}
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          error && styles.errorWrapper,
          !editable && styles.disabledWrapper,
        ]}
        accessibilityRole="none"
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && {
              height: Math.max(90, 24 * numberOfLines),
              textAlignVertical: 'top',
              paddingTop: 14,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry ? isPasswordHidden : false}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label || placeholder}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordHidden ? 'Show password' : 'Hide password'
            }
          >
            <Text style={styles.eyeIcon}>{isPasswordHidden ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        ) : null}
      </Pressable>

      {/* Error validation message */}
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1', // WCAG AA compliant contrast
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 52, // 48dp+ accessible touch target
  },
  focusedWrapper: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  errorWrapper: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  disabledWrapper: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#F3F4F6', // High contrast white
    fontWeight: '500',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 6,
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.9,
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    marginTop: 4,
    fontWeight: '600',
  },
});
