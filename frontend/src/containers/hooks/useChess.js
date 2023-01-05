import { createContext, useContext, useEffect, useState } from "react"
import { message } from 'antd'
import axios from "axios";

const API_ROOT =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "https://wpchess-production-71c8.up.railway.app";

const WS_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin.replace(/^http/, "ws")
    : "https://wpchess-production-71c8.up.railway.app";

export const api = axios.create({ baseURL: API_ROOT });
export const clientWS = new WebSocket(WS_URL);

const sendData = async ( data ) => {
    await clientWS.send( JSON.stringify( data ) )
}


const ChessContext = createContext(
    {
        hasLogin: Boolean,
        setHasLogin: () => {},

        hasStarted: Boolean,
        setHasStarted: () => {},

        registerFail: Boolean,
        setRegisterFail: () => {},

        registerFailMsg: "",
        setRegisterFailMsg: () => {},

        board: [], // 8*8 metrix 
        setBoard: () => {},

        turn: '', // 'w' or 'b'
        setTurn: () => {},

        myColor: '', // 'w' or 'b'
        setMyColor: () => {},

        focusP: [],
        setFocusP: () => {},

        winner: "",
        setWinner: () => {},

        endGame: Boolean,
        setEndGame: () => {},

        name: "", //player name
        setName: () => {},

        opponentName: "", //opponent name
        setOpponentName: () => {},

        roomNumber: "", //play room number (string)
        setRoomNumber: () => {},

        status: "",
        setStatus: () => {},

        waitingForOpponent: Boolean,
        setWaitingForOpponent: () => {},

        loginError: Boolean, //determone if user has enter correct or valid info
        setLoginError: () => {},

        loginErrorMsg: "",
        setLoginErrorMsg: () => {},

        joinError: Boolean,
        setJoinError: () => {},

        otherConnect: Boolean,
        setOtherConnect: () => {},

        preview: () => {},
        move: () => {},
        login: () => {},
        register: () => {},
        createRoom: () => {},
        joinRoom: () => {},
        backToLogin: () => {},
        backToJoin: () => {},

        messageApi: {},
        contextHolder: {},
        registerSuccess: () => {},
    }
)


const ChessProvider = ( props ) => {
    const [ hasLogin, setHasLogin ] = useState( false )
    const [ hasStarted, setHasStarted ] = useState( false )
    const [ registerFail, setRegisterFail ] = useState( false )
    const [ registerFailMsg, setRegisterFailMsg ] = useState( "" )
    const [ board, setBoard ] = useState( [] )
    const [ turn, setTurn ] = useState( '' )
    const [ myColor, setMyColor ] = useState( '' )
    const [ focusP, setFocusP ] = useState( [] )
    const [ winner, setWinner ] = useState( "" )
    const [ endGame, setEndGame ] = useState( false )
    const [ name, setName ] = useState( "Player" )
    const [ opponentName, setOpponentName ] = useState( "Waiting for Opponent" )
    const [ roomNumber, setRoomNumber ] = useState( "Welcome!" )
    const [ waitingForOpponent, setWaitingForOpponent ] = useState( true )
    const [ status, setStatus ] = useState( "" )
    const [ loginError, setLoginError ] = useState( false )
    const [ loginErrorMsg, setLoginErrorMsg ] = useState( "" )
    const [ joinError, setJoinError ] = useState( false )
    const [ otherConnect, setOtherConnect ] = useState( false )

    // jump msg
    const [ messageApi, contextHolder ] = message.useMessage()

    const registerSuccess = () => {
        messageApi.open( {
            type: "success",
            content: "Register Successed."
        } )
    }

    // back to login
    const backToLogin = () => {
        setRegisterFail( false )
        setBoard( [] )
        setTurn( "" )
        setMyColor( "" )
        setFocusP( [] )
        setWinner( "" )
        setStatus( "" )
        setLoginError( false )
        setJoinError( false )

        setName( "Player" )
        setOpponentName( "Waiting for Opponent" )
        setRoomNumber( "Welcome!" )
        setEndGame( false )
        setWaitingForOpponent( true )
        setHasLogin( false )
        setHasStarted( false )
        setOtherConnect( false )
    }

    const backToJoin = () => {
        setRegisterFail( false )
        setBoard( [] )
        setTurn( "" )
        setMyColor( "" )
        setFocusP( [] )
        setWinner( "" )
        setStatus( "" )
        setLoginError( false )
        setJoinError( false )

        setOpponentName( "Waiting for Opponent" )
        setRoomNumber( "Welcome!" )
        setEndGame( false )
        setWaitingForOpponent( true )
        setHasStarted( false )
        setOtherConnect( false )
    }

    // sending
    const preview = ( previewPos ) => {
        // get preview board 
        sendData( [ "preview", previewPos ] )
    }

    const move = ( from, to ) => {
        // get moved board 
        sendData( [ "move", { from, to } ] )
    }

    const login = ( name, password ) => {
        // login
        sendData( [ "login", [ name, password ] ] )
    }

    const register = ( name, password ) => {
        // register
        sendData( [ "register", [ name, password ] ] )
    }

    const init = () => {
        // get initial board 
        sendData( [ 'init' ] )
    }

    const createRoom = () => {
        // first person create a game room
        sendData( [ "createRoom" ] )
    }

    const joinRoom = ( roomNumber ) => {
        // second person join a room
        sendData( [ "joinRoom", roomNumber ] )
    }


    // receiving
    clientWS.onmessage = ( byteString ) => {
        const { data } = byteString
        const [ task, response ] = JSON.parse( data )
        switch ( task ) {

            case "rp_login": {
                const [ type, user ] = response
                if ( type === "Success" ) {
                    setName( user )
                    setHasLogin( true )
                } else {
                    setLoginErrorMsg( type )
                    setLoginError( true )
                }
                break
            }

            case "rp_register": {
                const msg = response
                if ( msg === "Success" ) {
                    setRegisterFail( false )
                    registerSuccess()
                } else {
                    setRegisterFail( true )
                    setRegisterFailMsg( msg )
                }
                break
            }

            case "createRoomSuccess": {
                const [ game, playerColor, gameID ] = response
                setHasStarted( true )
                setBoard( game.board )
                setTurn( game.turn )
                setStatus( game.status )
                setMyColor( playerColor )
                setRoomNumber( gameID )
                break
            }

            case "joinRoomSuccess": {
                const [ game, playerColor, gameID ] = response
                setHasStarted( true )
                setBoard( game.board )
                setTurn( game.turn )
                setStatus( game.status )
                setMyColor( playerColor )
                setRoomNumber( gameID )
                break
            }

            case "joinRoomFailed": {
                const errorMsg = response
                setJoinError( true )
                break
            }

            case "gameStarted": {
                const [ newGame, opName ] = response
                setWaitingForOpponent( false )
                setBoard( newGame.board )
                setTurn( newGame.turn )
                setStatus( newGame.status )
                setOpponentName( opName )
                break
            }

            case "init": {
                const { newBoard, turn, playerColor } = response
                setBoard( newBoard )
                setTurn( turn )
                setMyColor( playerColor )
                break
            }

            case "do": {
                const game = response
                setBoard( game.board )
                setTurn( game.turn )
                setStatus( game.status )
                if ( game.status === "checkmate" ) {
                    if ( game.turn === "w" ) {
                        setWinner( "b" )
                    } else {
                        setWinner( "w" )
                    }
                    setEndGame( true )
                }
                break
            }

            case "Logged in from other place": {
                setOtherConnect( true )
                break
            }

            case "sudden_game": {
                const [ game, opName, gameID, clr ] = response
                setWaitingForOpponent( false )
                setBoard( game.board )
                setTurn( game.turn )
                setStatus( game.status )
                setMyColor( clr )
                setRoomNumber( gameID )
                setOpponentName( opName )
                setHasStarted( true )
                break
            }
        }
    }

    useEffect( () => {
        setWinner( checkWinner() )
    }, [ board ] )

    const checkWinner = () => {
        if ( board.length == 0 ) {
            return ''
        }
        let winner = ''
        let whiteKing = false
        let blackKing = false
        for ( let x = 0; x < 8; x++ ) {
            for ( let y = 0; y < 8; y++ ) {
                if ( board[ x ][ y ].type == 'king' ) {
                    if ( board[ x ][ y ].color == 'w' ) {
                        whiteKing = true
                    }
                    else {
                        blackKing = true
                    }
                }
            }
        }

        if ( blackKing == false ) {
            winner = 'w'
        }
        else if ( whiteKing == false ) {
            winner = 'b'
        }
        else {
            winner = ''
        }

        return winner
    }

    return (
        <>
            {contextHolder}
            < ChessContext.Provider
                value={
                    {
                        hasLogin,
                        setHasLogin,

                        hasStarted,
                        setHasStarted,

                        registerFail,
                        setRegisterFail,

                        registerFailMsg,
                        setRegisterFailMsg,

                        board,
                        setBoard,

                        turn,
                        setTurn,

                        myColor,
                        setMyColor,

                        focusP,
                        setFocusP,

                        winner,
                        setWinner,

                        endGame,
                        setEndGame,

                        name,
                        setName,

                        opponentName,
                        setOpponentName,

                        roomNumber,
                        setRoomNumber,

                        status,
                        setStatus,

                        waitingForOpponent,
                        setWaitingForOpponent,

                        loginError,
                        setLoginError,

                        loginErrorMsg,
                        setLoginErrorMsg,

                        joinError,
                        setJoinError,

                        otherConnect,
                        setOtherConnect,

                        preview,
                        move,
                        login,
                        register,
                        createRoom,
                        joinRoom,
                        backToLogin,
                        backToJoin,
                    }
                }
                {...props}
            />
        </>
    )
}

const useChess = () => { return useContext( ChessContext ) }
export { useChess, ChessProvider }

//whyyyy