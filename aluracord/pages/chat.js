import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import {createClient} from "@supabase/supabase-js"
import {useRouter} from "next/router"
import { ButtonSendSticker } from "../src/components/ButtonSendSticker"


const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NDEwMzQ1OSwiZXhwIjoxOTU5Njc5NDU5fQ.vZDq3J48JqoZANvesLSUayPxaSOV-SbvgsiiIdejAzk"
const SUPABASE_URL = "https://ughbyeacdgeebarkjyim.supabase.co"
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function escutaMensagensEmTempoReal(adicionaMensagem){
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (respostaLive)=>{
      adicionaMensagem(respostaLive.new)
    })
    .subscribe()
}

export default function ChatPage() {
  // // Usuario
  // -Usuario digita no campo textarea
  // -Aperta enter para enviar
  // -Tem que adicionar o texto na listagem

  // //Dev
  // [x] Criar campo textarea
  // [x] usar o onChange e useState (ter if para caso seja enter, limpar a variavel)
  // [x] lista de mensagem
  const roteamento = useRouter()
  const usuarioLogado = roteamento.query.username
  const [mensagem, setMensagem] = React.useState("")
  const [listaDeMensagens, setListaDeMensagens] = React.useState([])

  React.useEffect(()=>{
    supabaseClient.from("mensagens").select("*")
    .order("id", {ascending: false}) //função da lib supabase para definir a ordem com que carregamos o array
    // aqui nós precisamos inverter a ordem do array, para que a ultima mensagem escrita apareça primeiro
    .then(({data})=>{
      console.log("dados da consulta: ", data)
      setListaDeMensagens(data)
    })  
    escutaMensagensEmTempoReal((novaMensagem)=>{
      setListaDeMensagens((valorAtualDaLista)=>{
        return [
          novaMensagem,
          ...valorAtualDaLista
        ]
      })
    })
  }, [])

  function handleNovaMensagem(novaMensagem) {
    //a mensagem não pode ser apenas texto, precisa de data, quem enviou etc,
    //portanto, antes de renderiza-la, vamos criar um objeto com todas essas informações
    const mensagem = {
      id: listaDeMensagens.length + 1,
      textoDaMensagem: novaMensagem,
      emissor: usuarioLogado,
    }

    supabaseClient
      .from("mensagens")
      .insert([mensagem]) //tem que ser um objeto com os MESMOS campos do supabase
      .then(({data})=>{
        // console.log("criando mensagens: ", data)
        // setListaDeMensagens([
        //   data[0],
        //   ...listaDeMensagens
        // ])
        //aqui nós trocamos a variavel mensagem pela resposta na posição zero (ver console.log de "data")
        // que é a mesma coisa, porém no servidor do supabase
      })
    //essa linha manda para o servidor do supabase as mensagens novas do usuario. 

    //setListaDeMensagens([mensagem, ...listaDeMensagens]);
    //essa linha foi descontinuada por usarmos o banco de dados, então ela terá algumas
    //modificções e ficará dentro do .then na função acima.

    setMensagem("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.neutrals["600"],
        backgroundImage:
          "url(https://virtualbackgrounds.site/wp-content/uploads/2020/07/earthrise-1536x864.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
          opacity: "0.9",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList mensagens={listaDeMensagens} />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              autoFocus
              value={mensagem}
              onChange={(evento) => {
                setMensagem(evento.target.value);
              }}
              onKeyPress={(evento) => {
                if (evento.key === "Enter") {
                  evento.preventDefault(); //para o enter não pular linha
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker)=>{
                handleNovaMensagem(":sticker: " + sticker)
              }}
            />
            {/* <Button
              onClick={()=>{
                handleNovaMensagem(mensagem);
              }}
              variant="tertiary"
              colorVariant="neutral"
              label="Enviar"
              styleSheet={{
                backgroundColor: appConfig.theme.colors.neutrals[800],
                color: appConfig.theme.colors.neutrals[200],
              }}
            /> */}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  )
}

function MessageList(props) {
  // console.log("MessageList", props);
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${mensagem.emissor}.png`}
              />
              <Text tag="strong">{mensagem.emissor}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {/* condicional booleane */}
            {mensagem.textoDaMensagem.startsWith(":sticker:") ? ( 
              // se for sticker executa o codigo abaixo
              <Image src={mensagem.textoDaMensagem.replace(":sticker:", "")}/>
            )
            :
            //se nao for sticker, executa a mensagem normal
            (mensagem.textoDaMensagem)} 
            
          </Text>
        )
      })}
    </Box>
  )
}
