/* eslint-disable */
// @ts-nocheck
/* prettier-ignore-start */

// MVP2.0 SignupPetRegisterPage.tsx
// 검증은 도메인 훅(SSOT)에서만 처리, UI는 결과를 내려받아 표시(값/메시지 ↓)
const Page = () => {
  const [form, setForm] = useState({
    name: '',
    species: '강아지',
    gender: '남아',
    birthDate: new Date(),
  });

  const {
    fieldErrorMessages, // 필드별 에러 메시지 맵
    isFormValid, // 전체 폼 유효성
    setFormField, // 값 변경 처리
    markFieldTouched, // 터치 처리
  } = usePetForm(form, setForm);

  return (
    <>
      <Form
        form={form} // value ↓
        fieldErrorMessages={fieldErrorMessages} // error ↓
        setFormField={setFormField}
        markFieldTouched={markFieldTouched}
      />
      <button disabled={!isFormValid}>다음</button>
    </>
  );
};

// MVP2.0 PetRegisterForm.tsx
// 내부 유효성 상태 없음. 여러 필드를 모아 렌더링(값/메시지 ↓)
const Form = ({ form, fieldErrorMessages, setFormField, markFieldTouched }) => {
  return (
    <form>
      <Input
        label="이름"
        value={form.name} // value ↓
        onValueChange={value => setFormField('name', value)}
        notifyTouched={() => markFieldTouched('name')}
        placeholder="반려동물 이름"
        errorMessage={fieldErrorMessages.name} // error ↓
      />
      {/* species, gender, ... 동일 패턴 */}
    </form>
  );
};

// MVP2.0 FormInput.tsx
// 완전한 프레젠테이션 컴포넌트 - 검증 로직 없음(전달 받은 값/메시지 표시)
const Input = ({ value, onValueChange, notifyTouched, errorMessage /* ... */ }) => {
  return (
    <>
      <label>{label}</label>
      <input
        value={value}
        onChange={e => onValueChange(e.target.value)} // 값 변경 상위로 알림
        onBlur={notifyTouched} // 터치 상위로 알림
        /* ... */
      />
      {Boolean(errorMessage) && <small>{errorMessage}</small>} //error ↓
    </>
  );
};

/**
 * 인용부
 */
const Page = () => {
  const [form, setForm] = useState({ name: '' });

  const {
    fieldErrorMessages, // 필드별 에러 메시지 맵
    isFormValid, // 전체 폼 유효성
    setFormField, // 값 변경 처리
    markFieldTouched, // 터치 처리
  } = usePetForm(form, setForm); // ✅ SSOT: 검증은 훅 내부에서만 처리

  // return (<Form ... /><button disabled={!isFormValid}>다음</button>);
};

const Form = ({ form, fieldErrorMessages, setFormField, markFieldTouched }) => {
  return <Input label="이름" value={form.name} /* species, gender, ... */ />;
};

const Input = ({ value, onValueChange, notifyTouched, errorMessage /* ... */ }) => {
  // ✅ 순수 프레젠테이션 컴포넌트 - 검증 로직 없음
  return <input value={value} /*...*/ />;
};
