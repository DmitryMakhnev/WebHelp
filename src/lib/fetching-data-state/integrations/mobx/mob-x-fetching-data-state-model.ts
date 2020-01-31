import { action, computed, observable } from 'mobx';
import { FetchingDataStateFlags } from '../../as-flags/fetching-data-state-flags';
import { mapFetchingDataStateToFlags } from '../../as-flags/mapping-fetching-data-states-to-flags';
import { fetchingDataStateMachine } from '../../fsm/fetching-data-state-machine';
import { FetchingDataStateActions } from '../../fsm/actions/fetching-data-state-actions';

/*
 * Sorry I can't live with uncontrolled set of flags
 *
 * EXTRA:
 * It should be separate library but I hadn't time for preparing and publishing of this
 * Also I use this in my projects but it's first integration with MobX
 */
export class MobXFetchingDataStateModel {
  @observable.ref
  private stateMachineState = fetchingDataStateMachine.initialState;

  @computed
  get state(): FetchingDataState {
    return this.stateMachineState.value as FetchingDataState;
  }

  @computed
  get asFlags(): FetchingDataStateFlags {
    return mapFetchingDataStateToFlags(this.state as FetchingDataState);
  }

  @action
  private transition(fetchingDataStateAction: FetchingDataStateAction) {
    this.stateMachineState = fetchingDataStateMachine.transition(
      this.stateMachineState,
      fetchingDataStateAction
    );
  }

  fetch(): MobXFetchingDataStateModel {
    this.transition(FetchingDataStateActions.FETCHING);
    return this;
  }

  success(): MobXFetchingDataStateModel {
    this.transition(FetchingDataStateActions.SUCCESS);
    return this;
  }

  fail(): MobXFetchingDataStateModel {
    this.transition(FetchingDataStateActions.FAILURE);
    return this;
  }

  reset(): MobXFetchingDataStateModel {
    this.transition(FetchingDataStateActions.RESET);
    return this;
  }
}
