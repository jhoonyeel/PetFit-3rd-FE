/* eslint-disable */
// @ts-nocheck
/* prettier-ignore-start */

// MVP2.0 AlarmPage.tsx
// 서버 상태는 React Query에서 관리하고, API 응답 결과를 하위로 전달
const AlarmPage = () => {
  const { petId, alarms } = useServerAlarmsOfSelectedPet();

  return (
    <>
      <h1>알람 목록</h1>
      <AlarmFeature petId={petId} alarms={alarms} />
    </>
  );
};

// MVP2.0 AlarmFeature.tsx
// 폼 드래프트(편집 상태) 단일 소유. 저장 성공 시 캐시 무효화 → Page는 최신 데이터로 자동 재조회
const AlarmFeature = ({ petId, alarms }) => {
  const { updateAlarmAndRefetch } = useAlarmMutationActions(petId);

  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const editAlarm = a => {
    setEditingId(a.id);
    setDraft({ id: a.id, title: a.title, content: a.content });
  };
  const handleUpdate = async () => {
    if (!draft || editingId == null) return;
    await updateAlarmAndRefetch(editingId, draft);
    setDraft(null);
    setEditingId(null);
  };

  return (
    <>
      <AlarmList alarms={alarms} onEdit={editAlarm} />
      <AlarmModal
        open={!!draft}
        draft={draft}
        onClose={() => {
          setDraft(null);
          setEditingId(null);
        }}
        onSubmit={handleUpdate}
        /* ... */
      />
    </>
  );
};

// MVP2.0 AlarmModal.tsx
// 순수 프레젠테이션. 상위에서 받은 draft를 표시
const AlarmModal = ({ open, draft, onClose, onSubmit /* ... */ }) => {
  if (!open) return null;

  return (
    <div>
      <h2>알람 수정</h2>
      <label>제목</label>
      <input
        value={draft.title}
        /* ... */
      />
      {/* 내용 필드 */}
      <button onClick={onClose}>닫기</button>
      <button onClick={onSubmit}>저장</button>
    </div>
  );
};

/**
 * 인용부
 */
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
