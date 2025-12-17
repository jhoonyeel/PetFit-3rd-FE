# AlarmFeature – SSOT 정립 (MVP1.0 → MVP2.0)

## ⚠️ Problem

- 서버 데이터를 다시 로컬 상태(alarmsLocalMirror)에 복제해 이중 소스로 관리.
- AlarmModal은 props로 받은 데이터를 다시 useState로 복사해 사본 동기화 비용 발생.
- 서버 데이터 변경 시 로컬 미러와 모달 사본이 어긋나 불일치 및 유지보수 리스크 증가.

## ✅ Fix

- 서버 상태를 React Query 캐시로 관리하여 단일 진실원(SSOT) 확보.
- 수정 시에는 단일 드래프트 상태만 관리하고, 저장 성공 시 **캐시 무효화(refetch)**로 자동 반영.
- AlarmModal은 순수 프레젠테이션 컴포넌트로 변경(검증·동기화 책임 제거).

## 📈 Result

- 데이터 중복 제거 및 서버·클라이언트 상태 간 불일치 해소.
- 캐시 무효화 기반 구조로 명령적 동기화 로직 제거, 코드 단순화.
- AlarmFeature가 편집 흐름을 단일 책임으로 가지며 Page/Modal 경계 명확화.

---

### 🔍 Snapshot A - MVP1.0 (문제 패턴)

```tsx
const AlarmPage = () => {
  // 🔴 서버 → 로컬 미러 중복 보관 및 동기화
  const [alarmsLocalMirror, setAlarmsLocalMirror] = useState([]);
  useEffect(() => {
    setAlarmsLocalMirror(serverAlarms);
  }, [serverAlarms]);

  // 🔴 모달 드래프트(엔터티 사본)
  const [modalDraft, setModalDraft] = useState(null);
  const applyModalDraft = async draft => {
    /* ... */
  };

  // return ( ... );
};

const AlarmModal = ({ initialDraft, onApply /* ... */ }) => {
  // 🔴 props를 로컬 상태로 다시 복제 → 사본 동기화 비용/불일치 리스크
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    if (initialDraft) setDraft(initialDraft);
  }, [initialDraft]);

  return <h2>알람 수정 모달...</h2>;
};
```

### 🔍 Snapshot B - MVP2.0 (React Query 기반 SSOT)

```tsx
const AlarmPage = () => {
  const { petId, serverAlarms } = useServerAlarmsOfSelectedPet();

  return <AlarmFeature petId={petId} alarms={serverAlarms} />;
};

const AlarmFeature = ({ petId, alarms }) => {
  const { updateAlarmAndRefetch } = useAlarmMutationActions(petId);

  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  // ✅ 수정 시: 해당 알람을 편집용 드래프트로 설정
  const editAlarm = alarm => {
    /* ... */
  };
  // ✅ 저장 시: 서버 반영 후 캐시 무효화로 최신 데이터 자동 반영
  const applyDraft = async draft => {
    /* ... */
  };

  // return ( ... );
};

const AlarmModal = ({ draft, onApply /* ... */ }) => {
  if (!draft) return null;

  return <h2>알람 수정 모달...</h2>;
};
```
