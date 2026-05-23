type Message = {
  text: string;
  sender: "user" | "bot";
};

export default async function chatbot(input: string){
     try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage: Message = {
        text: data.reply || "No response",
        sender: "bot",
      };

      return {status: res.status, message: botMessage}
    } catch (error) {
      return {status: 500, message: {text: "Error: Failed to get response", sender: "bot"}};
    }
}