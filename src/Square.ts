import { Field, SmartContract, state, State, method } from 'snarkyjs';

export class Square extends SmartContract {
  // Store a state variable using @state
  @state(Field) num = State<Field>();

  // Smart Contract Constructor
  init() {
    // Because we are exetending SmartContract and it has its own initialization
    // super.init() invokes this function on the base class
    super.init();

    // Initialize the on-state variable num to 3
    this.num.set(Field(3));
  }

  // Create a method to update the state variable
  // Use keyword @method
  @method update(square: Field) {
    // Grab the current state variable
    const currentState = this.num.get();

    // Assert that the arg 'square' is equal to currentState square
    this.num.assertEquals(currentState);
    square.assertEquals(currentState.mul(currentState));

    // Update the current state
    this.num.set(square);
  }
}
