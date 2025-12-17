# PetRegisterForm – SSOT 정립 (MVP1.0 → MVP2.0)

## ⚠️ Problem

- 유효성 검증이 Input → Form → Page로 단계적으로 되올라가며 책임이 분산됨.
- `allValid`/`fieldValidMap`을 여러 레벨에서 중복 보관 → 동기화 불일치/레이스.
- 화면 단위 리팩토링 시 검증 상태 흐름을 모두 추적해야 해 변경 비용 증가.

## ✅ Fix

- 검증/동기화/터치/DTO 변환을 **도메인 훅(`usePetForm`)**으로 단일화(SSOT).
- UI 컴포넌트는 **값/메시지 표시**만 담당(프레젠테이션).
- 상·하위의 유효성 상태 보관 제거(중복 소스 삭제).

## 📈 Result

- **동기화 비용 제거**, 불일치 리스크 감소.
- **테스트 포인트 단순화**(도메인 로직 vs UI 분리).
- 구조가 단순해져 **주석이 줄어도 의도가 읽힘**.

---

### 🔍 Snapshot A - MVP1.0 (문제 패턴)

```tsx
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
```

### 🔍 Snapshot B - MVP2.0 (도메인 훅 기반 SSOT)

```tsx
const Page = () => {
  const [form, setForm] = useState({ name: '', });

  const {
    fieldErrorMessages,  // 필드별 에러 메시지 맵
    isFormValid,         // 전체 폼 유효성
    setFormField,        // 값 변경 처리
    markFieldTouched,    // 터치 처리
  } = usePetForm(form, setForm); // ✅ SSOT: 검증은 훅 내부에서만 처리

  // return (<Form ... /><button disabled={!isFormValid}>다음</button>);
};

const Form = ({
  form,
  fieldErrorMessages,
  setFormField,
  markFieldTouched,
}) => {
  return (
    <Input label='이름' value={form.name} /*...*/ />
    {/* species, gender, ... 동일 패턴 */}
  );
};

const Input = ({ value, onValueChange, notifyTouched, errorMessage, /* ... */ }) => {
  // ✅ 순수 프레젠테이션 컴포넌트 - 검증 로직 없음
  return <input value={value} /*...*/ />
};
```
