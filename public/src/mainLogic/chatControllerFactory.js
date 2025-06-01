// I think I'd like this go generate an element. It will follow the standard model where
// the factory function creates the chat controller. The chat controller in turn will have a method
// to initiate. It will need to return an element. p

// Perhaps this should only be a chat box (i.e. the input). The messages will be rendered by the game
// log history component. This function doesn't care about receiving messages, only sending. 

//  Let's get started by just creating a simple chat window. It should work for either hotseat or
// online, or the waiting room. Remember that ultimately it's just calling a game controller method. 
// Oh but if it's the waiting room how will that work with the logic bundle? Perhaps this should just be
// a helper method. Maybe when initialized it takes in a method to call? I feel like maybe we move this 
// to the helper file. If so it doesn't need to follow the factory model, right?


export const chatControllerFactory = () => {
    // HERE! this should return a fairly simple element, just a text entry form with a 'Submit' button
    // The on-click will call the method that was passed in during initialization 
}