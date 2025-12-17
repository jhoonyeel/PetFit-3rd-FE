/* eslint-disable */
// @ts-nocheck
/* prettier-ignore-start */

// MVP1.0 SignupPetRegisterPage.tsx
// 최상위에서 유효성 상태를 따로 보관 → allValid 종착점
const Page = () => {
  const [form, setForm] = useState({
    name: '',
    species: '강아지',
    gender: '남아',
    birthDate: new Date(),
  });
  const [isPetFormValid, setIsPetFormValid] = useState(false);

  return (
    <>
      <Form
        form={form}
        setForm={setForm}
        updateFormValid={setIsPetFormValid} // allValid ↑
      />
      <button disabled={!isPetFormValid}>다음</button>
    </>
  );
};

// MVP1.0 PetRegisterForm.tsx
// 하위에서 올라온 필드 유효성들을 다시 합산해 Page로 되올림(allValid ↑)
const Form = ({ form, setForm, updateFormValid }) => {
  const [fieldValidMap, setFieldValidMap] = useState({
    name: false,
    // species: true, gender: true, ...
  });

  useEffect(() => {
    const allValid = Object.values(fieldValidMap).every(Boolean);
    updateFormValid(allValid); // allValid ↑
  }, [fieldValidMap, updateFormValid]);

  const validateName = name => Boolean(name.trim());

  return (
    <Input
      value={form.name}
      validator={validateName} // child 검증
      onValidityChange={isValid => setFieldValidMap(prev => ({ ...prev, name: isValid }))} // isValid ↑
      /* ... */
    />
  );
};

// MVP1.0 FormInput.tsx
// child 검증 후 isValid만 상위로 되올림(isValid ↑)
const Input = ({ value, validator, onValidityChange /* ... */ }) => {
  const handleBlur = e => {
    const isValid = validator(e.currentTarget.value); // child 검증
    onValidityChange(isValid); // isValid ↑ (상위로 전달)
  };

  return (
    <>
      <label>이름</label>
      <input value={value} onBlur={handleBlur} /* ... */ />
    </>
  );
};

/**
 * 인용부
 */
const Page = () => {
  const [form, setForm] = useState({ name: '' });
  // 🔴 (중복 보관) 최상위에서 allValid를 별도 보관
  const [isPetFormValid, setIsPetFormValid] = useState(false);

  return (
    <>
      <Form updateFormValid={setIsPetFormValid} /* ... */ /> // ⬆️ allValid ↑
      <button disabled={!isPetFormValid}>다음</button>
    </>
  );
};

const Form = ({ updateFormValid /* ... */ }) => {
  // 🔴 (중복 보관) 필드별 유효성 로컬 상태 보관 + 합산 후 Page로 되올림
  const [fieldValidMap, setFieldValidMap] = useState({ name: false });
  useEffect(() => {
    const allValid = Object.values(fieldValidMap).every(Boolean);
    updateFormValid(allValid); // ⬆️ allValid ↑ (Form → Page)
  }, [fieldValidMap, updateFormValid]);

  // return ( ... );
};

const Input = ({ onValidityChange /* ... */ }) => {
  // 🔴 Input이 유효성 책임을 가짐(책임 분산)
  const handleBlur = e => {
    const isValid = !!e.currentTarget.value.trim();
    onValidityChange(isValid); // ⬆️ isValid ↑ (Input → Form)
  };

  return <input placeholder="이름" onBlur={handleBlur} /* ... */ />;
};
