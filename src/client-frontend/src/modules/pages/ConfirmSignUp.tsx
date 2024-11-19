import { useSelector } from "react-redux";
import { RootState } from "../../store";
import FormButton from "../form/FormButton";

function ConfirmSignUp() {
    const user = useSelector((state: RootState) => state.userAuthAndInfo.user)

    const handleSubmit = () => {
        confirmUser(user.email)
        loginUser(user.email, user.password)
    }

    const confirmUser = async (email: string) => {
        const user = await fetch(
            `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/confirm`,
            {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email
              })
              }
        )
    };
    const loginUser = async (email: string, password: string) => {
        const response = await fetch(
          `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: password
          })
          }
        );
    
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
    
        const data = await response.json();
        console.log(data)
        return data;
      };
      
  return (
    <div>
      <FormButton
      sx={{ mt: 3, mb: 2 }}
      color="secondary"
      fullWidth
      onSubmit={}
      >
      {'In progress…'}
      </FormButton>
    </div>
  )
}

export default ConfirmSignUp