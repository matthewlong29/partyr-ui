import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URLStore } from '../classes/constants/url-store';
import { BlackHandRoleRespObject } from '../classes/models/shared/black-hand/black-hand-role-resp-object';
import { LobbyRoom } from '../classes/models/shared/lobby-room';
import { BlackHandNumberOfPlayers } from '../classes/models/shared/black-hand/black-hand-number-of-players';
import { WebsocketService } from './websocket.service';
import { WsBrokerStore } from '../classes/constants/ws-broker-store';
import { BlackHandDetails } from '../classes/models/shared/black-hand/black-hand-details';
import { Faction } from '../classes/constants/type-aliases';
import { BlackHandPlayerTurn } from '../classes/models/shared/black-hand/black-hand-player-turn';

@Injectable({
  providedIn: 'root'
})
export class BlackHandService {
  constructor(readonly http: HttpClient, readonly wsSvc: WebsocketService) {}

  /***** WAITING ROOM ACTIONS AND MONITORING *****/
  /** getBlackHandRoles
   * @desc get the roles lists for the Black Hand game
   */
  getBlackHandRoles(): Observable<BlackHandRoleRespObject> {
    return this.http.get<BlackHandRoleRespObject>(URLStore.GET_BH_ROLES);
  }

  /** getBlackHandRoleTotals 
   * @desc get the number of players needed for each role with the specified player total
   */
  getBlackHandRoleTotals(playerTotal: number): Observable<any> {
    return this.http.get<BlackHandNumberOfPlayers>(`${URLStore.GET_BH_FACTION_QUOTA}/${playerTotal}`);
  }

  /** getGameDetails 
   * @desc http request for current game details status
   */
  getGameDetails(roomName: string): Observable<BlackHandDetails> {
    return this.http.get<BlackHandDetails>(`${URLStore.GET_BH_GAME_DETAILS}/${roomName}`);
  }

  /** startGame
   * @desc send the message to start the game
   */
  startGame(roomName: string): void {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_START_SEND, { roomName });
  }

  /** watchGameDetails
   * @desc watch changes to game details status through websocket
   */
  watchGameDetails(): Observable<BlackHandDetails> {
    return this.wsSvc.watch(WsBrokerStore.BH_GAME_DETAILS_BROKER);
  }

  /***** GAME SETTINGS *****/

  /** updateDisplayName 
   * @desc change the user's display name for the specified game
   */
  updateDisplayName(username: string, displayName: string, roomName: string) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_SELECT_DISPLAY_NAME, { username, displayName, roomName });
  }

  /** updateGameSettings 
   * @desc update the settings for the specified Black Hand game
   */
  updateGameSettings() {
    // TODO: Add once websocket message is added
  }

  /** selectPreferredFaction
   * @desc select the preferred faction for the specified player
   */
  selectPreferredFaction(username: string, roomName: string, preferredFaction: Faction) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_SELECT_PREFERRED_FACTION, { username, roomName, preferredFaction });
  }

  /***** IN-GAME WEBSOCKET MESSAGES *****/

  /** submitTurn 
   * @desc submit a user's turn
   */
  submitTurn(turn: BlackHandPlayerTurn) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_SUBMIT_TURN, turn);
  }

  /** evaluateDay 
   * @desc evaluate the day phase and push the updated game results
   */
  evaluateDay(roomName: string) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_EVALUATE_DAY, { roomName });
  }

  /** evaluateNight
   * @desc evaluate the night phase and push the updated game results
   */
  evaluateNight(roomName: string) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_EVALUATE_NIGHT, { roomName });
  }

  /** evaluateTrial 
   * @desc evaluate the trial phase and push the updated game results
   */
  evaluateTrial(roomName: string) {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_EVALUATE_TRIAL, { roomName });
  }

  /** submitVote 
   * @desc submit the player's vote for the trial phase
   */
  submitVote(roomName: string, username: string, vote: 'GUILTY' | 'NOT_GUILTY') {
    this.wsSvc.publish(WsBrokerStore.BLACK_HAND_SUBMIT_VOTE, { roomName, username, vote });
  }
}
