import { useEffect, useState, type TextareaHTMLAttributes } from 'react';

import styled from 'styled-components';

import { tx } from '@/styles/typography';
import type { BaseFieldProps } from '@/types/pet';
import { MAX_LENGTH, validators, type ValidationType } from '@/utils/validators';

type NativeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>;

interface FormTextareaProps extends BaseFieldProps, NativeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  validationType: ValidationType;
  placeholder?: string;
  onFieldValidChange: (isValid: boolean) => void;
  optional?: boolean;
}

export const FormTextarea = ({
  label,
  value,
  onChange,
  validationType,
  placeholder,
  onFieldValidChange,
  optional = false,
  ...rest
}: FormTextareaProps) => {
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasError = !!errorMessage;
  const maxLength = MAX_LENGTH[validationType];

  useEffect(() => {
    const trimmed = value?.trim() ?? '';

    // ✅ optional & 빈 값 → 항상 통과(에러 숨김, 부모에 true 전달)
    if (optional && trimmed === '') {
      if (errorMessage !== null) setErrorMessage(null);
      onFieldValidChange(true);
      return;
    }

    // ✅ 값이 입력된 경우엔 기존 로직 유지(blur 이후에만 에러 표기/전달)
    if (!isTouched) return;

    const { isValid, message } = validators[validationType](value);
    setErrorMessage(!isValid ? message : null);
    onFieldValidChange(isValid);
  }, [value, validationType, isTouched, onFieldValidChange]);

  const handleBlur = () => {
    setIsTouched(true);

    // blur 시점에 값이 있으면 즉시 1회 검증(UX 보강)
    const trimmed = value?.trim() ?? '';
    if (!(optional && trimmed === '')) {
      const { isValid, message } = validators[validationType](value);
      setErrorMessage(!isValid ? message : null);
      onFieldValidChange(isValid);
    }
  };

  return (
    <FieldGroup>
      {label && <Label $hasError={hasError}>{label}</Label>}
      <StyledTextarea
        {...rest}
        $hasError={hasError}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        maxLength={maxLength + 10}
        placeholder={placeholder}
      />
      <HelperRow>
        <ErrorMessage $isVisible={hasError}>{errorMessage}</ErrorMessage>
        <CharCount $hasError={hasError}>
          {value.length}/{maxLength}
        </CharCount>
      </HelperRow>
    </FieldGroup>
  );
};

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $hasError?: boolean }>`
  padding-left: 8px;
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.color.warning[500] : theme.color.gray[600]};
  ${tx.body('reg14')};
`;

const StyledTextarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  height: 100px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.color.main[100]};
  border: 1.5px solid
    ${({ theme, $hasError }) => ($hasError ? theme.color.warning[500] : theme.color.main[500])};
  border-radius: 16px;
  ${tx.body('semi14')};
  resize: none;
`;

const HelperRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`;

const CharCount = styled.span<{ $hasError?: boolean }>`
  ${tx.caption('med12')};
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.color.warning[500] : theme.color.gray[400]};
`;

const ErrorMessage = styled.p<{ $isVisible?: boolean }>`
  color: ${({ theme }) => theme.color.warning[500]};
  ${tx.caption('med12')};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
`;
