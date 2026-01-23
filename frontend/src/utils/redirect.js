async function redirect(user, navigate = async () => {}, location=""){
  if (user == null){
    await navigate("/login/")
  } else if (user.reset_required) {
    await navigate("/change_password/")
  } else if (location === "/login/"){
    await navigate("/dashboard/")
  }
}
export default redirect