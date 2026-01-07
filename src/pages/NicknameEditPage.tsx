import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { editNickname, getNickname } from '@/apis/auth';
import { FormInput } from '@/components/common/FormInput';
import { TitleHeader } from '@/components/common/TitleHeader';

export const NicknameEditPage = () => {
  const navigate = useNavigate();

  const { data: userInfo } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => getNickname(),
  });

  const [nickname, setNickname] = useState('');
  const [isValid, setIsValid] = useState(false);
  const isDisabled = !nickname.trim() || !isValid;

  useEffect(() => {
    if (userInfo?.nickname) {
      setNickname(userInfo.nickname);
    }
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleSave = async () => {
    if (!isValid || !nickname.trim()) return;

    await editNickname(nickname);
    navigate(-1);
  };
  return (
    <div>
      <TitleHeader
        title="마이페이지"
        showBack={true}
        right={
          <SaveButton disabled={isDisabled} onClick={handleSave}>
            저장
          </SaveButton>
        }
      />
      <InputContainer>
        <FormInput
          label="닉네임"
          value={nickname}
          onChange={handleChange}
          validationType="nickname"
          onFieldValidChange={setIsValid}
          placeholder="닉네임을 입력하세요"
        />
      </InputContainer>
    </div>
  );
};

const SaveButton = styled.button`
  white-space: nowrap;
  font-size: 14px;
  padding: 0;

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const InputContainer = styled.div`
  margin: 20px;
`;
