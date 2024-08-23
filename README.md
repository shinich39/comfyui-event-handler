# comfyui-event-handler
Javascript code will run when an event fires.  

## Features  
Manipulate nodes when event fires.  

## Nodes  
Add node > utils > Event Handler  

## Usage  
Select event.  
Enter javascript code.  

## Variables  
- SELF => Node;
- STATE => Object : Store values until ComfyUI closed.
- PROPS => Object : Store values until node removed.
- NODES => Array : All nodes in workflow.
- LINKS => Array : All connections in workflow.
- SEED => Number : Generate random seed for current event.
- ARGS => Array : Event arguments.
- DATE => Date
- YEAR => Number
- MONTH => Number
- DAY => Number
- HOURS => Number
- MINUTES => Number
- SECONDS => Number

## Methods  
ID, Title, Type can be used instead of NODE.  

- find(ID|TITLE|TYPE) => Node
- findLast(ID|TITLE|TYPE) => Node
- getValues(NODE) => Object
- setValues(NODE, values)
- connect(OUTPUT_NODE, OUTPUT_NAME, INPUT_NODE, INPUT_NAME|null)
- random(min, max) => Number
- getRandomSeed() => Number
- enable(NODE) : Bypass
- disable(NODE) : Bypass
- toggle(NODE) : Bypass
- remove(NODE)
- select(NODE)
- putOnLeft(NODE, TARGET_NODE)
- putOnRight(NODE, TARGET_NODE)
- putOnTop(NODE, TARGET_NODE)
- putOnBottom(NODE, TARGET_NODE)
- moveToRight(NODE)
- moveToBottom(NODE)
- moveX(NODE, number)
- moveY(NODE, number)
- generate() : Start generation.
- cancel() : Cancel current generation.
- stop() : Disable auto queue mode.

## Debug  
Create a Note.  
Change title to "Debug"  
Create a EventHandler.  
Copy and paste the text below.  

```
setValues("Debug", {
  "": "This is text for debugging."
});
```

