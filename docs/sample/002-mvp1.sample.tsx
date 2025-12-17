/* eslint-disable */
// @ts-nocheck
/* prettier-ignore-start */

// MVP1.0 AlarmPage.tsx
// 서버 데이터를 로컬 상태로 다시 복제하고, Modal 결과로 로컬 미러를 수동 갱신
const AlarmPage = () => {
  const { serverAlarms } = useServerAlarmsOfSelectedPet();

  const [alarmsLocalMirror, setAlarmsLocalMirror] = useState([]);
  const [modalDraft, setModalDraft] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setAlarmsLocalMirror(serverAlarms);
  }, [serverAlarms]);

  const openEditModal = alarm => {
    setModalDraft(alarm);
    setModalOpen(true);
  };
  const applyModalDraft = async draft => {
    const saved = await updateAlarm(draft.id, draft);
    setAlarmsLocalMirror(prev => prev.map(a => (a.id === saved.id ? saved : a)));
    setModalOpen(false);
    setModalDraft(null);
  };

  return (
    <>
      <h1>알람 목록</h1>
      <AlarmList alarms={alarmsLocalMirror} onEdit={openEditModal} />
      <AlarmModal
        isOpen={isModalOpen}
        initialDraft={modalDraft}
        onClose={() => {
          setModalOpen(false);
          setModalDraft(null);
        }}
        onApply={applyModalDraft}
      />
    </>
  );
};

// MVP1.0 AlarmList.tsx
// 순수 프레젠테이션: 목록 렌더만 담당(비즈니스 로직 없음)
const AlarmList = ({ alarms, onEdit }) => {
  if (alarms.length === 0) return null;

  return (
    <ul>
      {alarms.map(a => (
        <li key={a.id}>
          <strong>{a.title}</strong>
          <p>{a.content}</p>
          <button onClick={() => onEdit(a)}>수정</button>
        </li>
      ))}
    </ul>
  );
};

// MVP1.0 AlarmModal.tsx
// 엔터티 사본을 내부 상태로 보관하고, open 시 props → state 복사(사본 동기화)
const AlarmModal = ({ isOpen, initialDraft, onClose, onApply }) => {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (isOpen && initialDraft) setDraft(initialDraft);
  }, [isOpen, initialDraft]);

  if (!isOpen || !draft) return null;

  return (
    <div>
      <h2>알람 수정</h2>
      <input
        value={draft.title}
        onChange={e => setDraft({ ...draft, title: e.target.value })}
        placeholder="제목"
      />
      {/* 내용 필드... */}
      <button onClick={onClose}>닫기</button>
      <button onClick={() => onApply(draft)}>저장</button>
    </div>
  );
};

/**
 * 인용부
 */
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
