import { InfoHint } from "@auth-econovation/ui";
import ClientCreateForm from "@/components/clients/ClientCreateForm";

/**
 * 클라이언트 등록 페이지(`/clients/new`).
 */
const ClientNewPage = () => {
  return (
    <div className="w-full max-w-[1144px] p-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl leading-8 font-bold tracking-[-0.01em]">
          클라이언트 등록
          <InfoHint label="클라이언트 등록이란?">
            <strong className="mb-1 block">클라이언트 등록이란?</strong>
            ECONO SSO로 로그인을 연동할 서비스(웹앱·API)를 등록하는 단계입니다.
            등록하면 발급되는 <code>clientId</code>로 SSO가 어느 서비스의 로그인
            요청인지 식별하고, 등록된 redirect URI로만 인증 결과를 돌려보냅니다.
          </InfoHint>
        </h1>
        <p className="mt-0.5 text-xs leading-[18px] text-ink-soft">
          SSO에 연동할 서비스를 등록하고 clientId를 발급받습니다.
        </p>
      </div>
      <ClientCreateForm />
    </div>
  );
};

export default ClientNewPage;
