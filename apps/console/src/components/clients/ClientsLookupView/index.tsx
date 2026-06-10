import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardBody } from "@auth-econovation/ui";
import { isUuid } from "@/lib/validators";
import { inputClass } from "@/lib/inputClass";

/**
 * clientId 단건 조회 임시 뷰. 목록 조회 API가 미확정일 때의 대안 화면으로,
 * UUID를 입력받아 상세 페이지로 이동합니다.
 */
const ClientsLookupView = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isUuid(value)) {
      setError("UUID 형식이 아닙니다. 예: a1b2c3d4-7f21-4e08-9b3a-def012345678");
      return;
    }
    navigate(`/clients/${value.trim()}`);
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="lookup-client-id"
            className="mb-2 block text-sm font-medium"
          >
            clientId로 조회
          </label>
          <div className="flex gap-2">
            <input
              id="lookup-client-id"
              className={`${inputClass({ mono: true, error: !!error })} max-w-[420px]`}
              placeholder="a1b2c3d4-7f21-4e08-9b3a-def012345678"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
            />
            <Button variant="secondary" type="submit">
              조회
            </Button>
          </div>
          {error ? (
            <div className="mt-2 text-xs text-danger">{error}</div>
          ) : (
            <div className="mt-2 text-xs text-ink-soft">
              목록 API 준비 전 임시 화면입니다. 등록 시 발급된 clientId를 입력하세요.
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default ClientsLookupView;
