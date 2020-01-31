import { createMachine } from '@xstate/fsm';
import { FetchingDataStates } from './value/fetching-data-states';
import { FetchingDataStateActions } from './actions/fetching-data-state-actions';

export type FSMContext = {};

export interface FMSType {
  value: FetchingDataState;
  context: FSMContext;
}

export interface FSMAction {
  type: FetchingDataStateAction;
}

/**
 * @description FSM for controlling of fetching data state
 *    scheme: https://xstate.js.org/viz/?gist=561640b1239ba9da0ae77bfc1188cd7b
 *    motivation:
 *      - not clear flow of state changes for all code holders;
 *      — inconsistency during usage of pure states;
 *      — business logic code duplication;
 *      — bugs;
 *    recommended sources:
 *      video:
 *        David Khourshid — The visual future of reactive applications with statecharts
 *        https://www.youtube.com/watch?v=o84Xw8qiTCw*
 */
export const fetchingDataStateMachine = createMachine<
  FSMContext,
  FSMAction,
  FMSType
>({
  id: 'FetchingDataStateMachine',
  initial: FetchingDataStates.NONE,
  states: {
    [FetchingDataStates.NONE]: {
      on: {
        [FetchingDataStateActions.FETCHING]: FetchingDataStates.LOADING,
      },
    },

    [FetchingDataStates.READY]: {
      on: {
        [FetchingDataStateActions.FETCHING]: FetchingDataStates.UPDATING,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },

    // loading
    [FetchingDataStates.LOADING]: {
      on: {
        [FetchingDataStateActions.SUCCESS]: FetchingDataStates.READY,
        [FetchingDataStateActions.FAILURE]:
          FetchingDataStates.FAILURE_DURING_LOADING,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },
    [FetchingDataStates.FAILURE_DURING_LOADING]: {
      on: {
        [FetchingDataStateActions.FETCHING]:
          FetchingDataStates.LOADING_AFTER_FAILURE,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },
    [FetchingDataStates.LOADING_AFTER_FAILURE]: {
      on: {
        [FetchingDataStateActions.SUCCESS]: FetchingDataStates.READY,
        [FetchingDataStateActions.FAILURE]:
          FetchingDataStates.FAILURE_DURING_LOADING,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },

    // update
    [FetchingDataStates.UPDATING]: {
      on: {
        [FetchingDataStateActions.SUCCESS]: FetchingDataStates.READY,
        [FetchingDataStateActions.FAILURE]:
          FetchingDataStates.FAILURE_DURING_UPDATE,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },
    [FetchingDataStates.FAILURE_DURING_UPDATE]: {
      on: {
        [FetchingDataStateActions.FETCHING]:
          FetchingDataStates.UPDATING_AFTER_FAILURE,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },
    [FetchingDataStates.UPDATING_AFTER_FAILURE]: {
      on: {
        [FetchingDataStateActions.SUCCESS]: FetchingDataStates.READY,
        [FetchingDataStateActions.FAILURE]:
          FetchingDataStates.FAILURE_DURING_UPDATE,
        [FetchingDataStateActions.RESET]: FetchingDataStates.NONE,
      },
    },
  },
});
