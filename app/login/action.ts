"use server"; // 이 함수가 서버에서만 실행되도록

const handleForm = async (preState: any, formData: FormData) => {
  console.log(preState, formData.get("email"), formData.get("password"));
  return {
    errors: ["Short password"],
  };
};

export default handleForm;
