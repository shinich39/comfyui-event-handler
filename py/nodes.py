EVENTS = (
  "before_queued",
  "after_queued",
  "status",
  "progress",
  "executing",
  "executed",
  "execution_start",
  "execution_success",
  "execution_error",
  "execution_cached",
  "b_preview",
)

class EventHandler():
  def __init__(self):
    pass

  @classmethod
  def IS_CHANGED(s):
    return float("NaN")

  @classmethod
  def INPUT_TYPES(cls):
    return {
      "required": {
        "event": (EVENTS,),
        "javascript": ("STRING", {"default": "", "multiline": True}),
      }
    }
  
  CATEGORY = "utils"
  FUNCTION = "exec"
  RETURN_TYPES = ()

  def exec(self, **kwargs):
    return ()

NODE_CLASS_MAPPINGS = {
  "EventHandler": EventHandler,
}

NODE_DISPLAY_NAME_MAPPINGS = {
  "EventHandler": "Event Handler",
}