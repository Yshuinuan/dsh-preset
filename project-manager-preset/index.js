/**
 * Approval gate for the project-manager preset.
 *
 * Every `subagent` call from the 总控 (project manager) is turned into the
 * tools pipeline's `ask` decision, which opens the standard approval composer.
 * The child session starts only after the user allows that one call; reject,
 * cancel, or an unavailable approval channel leaves the child unstarted.
 *
 * The gate is intentionally narrow: it only checks the tool name. The preset
 * mounts exactly one `subagent` tool, and `send_message` cannot create a child,
 * so new P sessions cannot be started through another path.
 */

export const name = 'project-manager-subagent-approval'

export const inject = ['tools']

/**
 * Collapse model-provided text into one readable line for the audited reason.
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function oneLine(value, fallback) {
  if (typeof value !== 'string') return fallback
  const text = value.replace(/\s+/gu, ' ').trim()
  if (text === '') return fallback
  return text.length > 160 ? `${text.slice(0, 157)}...` : text
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  ctx.on('tools/pre-execute', async (exec, next) => {
    if (exec.name !== 'subagent') return next()

    const args = exec.arguments !== null && typeof exec.arguments === 'object' && !Array.isArray(exec.arguments)
      ? exec.arguments
      : {}
    const child = oneLine(args.name, '未命名子会话')
    const task = oneLine(args.description, '未命名任务')

    // Let other pre-execute policies deny or cancel first; only an otherwise
    // allowed spawn reaches the user for approval.
    const downstream = await next()
    if (downstream.kind !== 'allow') return downstream

    return {
      kind: 'ask',
      reason: `assign a task to subagent "${child}": ${task}`,
      displayReason: {
        en: `The project manager wants to start subagent "${child}" for "${task}". Check its task document and kickoff prompt in the tool call above, then approve. The child starts only after you allow this call.`,
        zh: `总控准备启动子会话「${child}」，任务：${task}。请先核对上方工具调用里的任务书路径和开工语，再批准；批准后子会话才会开始。`,
      },
    }
  })
}
