import getSession from "./session";

const loginUser = async (id: number) => {
  const session = await getSession();
  session.id = id;
  await session.save();
};

export default loginUser;
