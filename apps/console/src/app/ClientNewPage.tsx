import ClientCreateForm from "@/components/clients/ClientCreateForm";

/**
 * 클라이언트 등록 페이지(`/clients/new`).
 */
const ClientNewPage = () => {
  return (
    <div className="w-full max-w-[1144px] p-8">
      <div className="mb-6">
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em]">
          클라이언트 등록
        </h1>
      </div>
      <ClientCreateForm />
    </div>
  );
};

export default ClientNewPage;
