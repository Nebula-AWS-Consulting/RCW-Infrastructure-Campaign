

function ConfirmSignUp() {
    const getUser = async (email: string) => {
        const response = await fetch(
          `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX${email}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
    
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
    
        const data = await response.json();
        return data;
      };

    const confirmUser = async (email: string) => {
        const user = await getUser(email);
      };
  return (
    <div>
        
    </div>
  )
}

export default ConfirmSignUp