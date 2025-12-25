import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReport } from '@/apis/ai-report';
import { TitleHeader } from '@/components/common/TitleHeader';
import styled from 'styled-components';
import { tx } from '@/styles/typography';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AIReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  }, []);

  const { data: reportDetail } = useQuery({
    queryKey: ['reportDetail', reportId],
    queryFn: () => getReport(Number(reportId)),
    enabled: selectedPetId !== null,
  });

  if (!reportDetail) return <div>리포트를 찾을 수 없습니다.</div>;

  return (
    <>
      <TitleHeader title="분석 결과" showBack={true} />
      <Container>
        <Title>{reportDetail.title}</Title>
        <Date>
          기간 | {reportDetail.startDate} ~ {reportDetail.endDate}
        </Date>
      </Container>

      <Divider />
      <Container>
        <Content>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h3: ({ node, ...props }) => (
                <h3 style={{ margin: '16px 0 8px', fontWeight: 600 }} {...props} />
              ),
              strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
              p: ({ node, ...props }) => <p style={{ marginBottom: 10 }} {...props} />,
              li: ({ node, ...props }) => (
                <li style={{ marginBottom: 6, listStylePosition: 'outside' }} {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul style={{ marginLeft: 20, marginBottom: 12, listStyle: 'disc' }} {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol style={{ marginLeft: 20, marginBottom: 12, listStyle: 'decimal' }} {...props} />
              ),
            }}
          >
            {reportDetail.content}
          </ReactMarkdown>
        </Content>
      </Container>
    </>
  );
};

const Container = styled.div`
  padding: 10px 20px 0;
`;

const Title = styled.h2`
  ${tx.title('semi18')};
  margin-bottom: 8px;
`;

const Date = styled.div`
  ${tx.caption('med12')};
  color: ${({ theme }) => theme.color.gray[400]};
  margin-bottom: 20px;
`;

const Divider = styled.div`
  height: 4px;
  background-color: ${({ theme }) => theme.color.gray[200]};
`;
const Content = styled.div`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[700]};
  line-height: 1.6;
`;
