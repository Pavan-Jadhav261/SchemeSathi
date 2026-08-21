import { AgentController } from "./agent-controller"
import type { ExtensionMessage } from "../shared/types"

const controller = new AgentController()
chrome.runtime.onMessage.addListener((message: ExtensionMessage) => controller.receive(message))
