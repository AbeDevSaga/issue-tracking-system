export const canMarkInProgress = (
  user_id: string,
  issueStatus: string,
  object: any
): boolean => {
  // Check if status is "in progress"
  if (issueStatus === "in_progress") {
    return false;
  }

  // Check if user_id exists in any escalation
  if (
    object?.escalations?.some(
      (escalation: any) =>
        escalation.escalated_by === user_id ||
        escalation.escalator?.user_id === user_id
    )
  ) {
    return false;
  }

  return true;
};

export const canResolve = (
  user_id: string,
  issueStatus: string,
  object: any
): boolean => {
  // Check if status is not "in progress"
  if (issueStatus !== "in_progress") {
    return false;
  }

  // Find the last "accepted" action in history
  const history = object?.history || [];

  console.log("history:", history);

  console.log("object:", object);
  // Filter only "accepted" actions and get the most recent one
  const acceptedActions = history
    .filter((item: any) => item.action === "accepted")
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // If there are no accepted actions, return false
  if (acceptedActions.length === 0) {
    return false;
  }

  // Get the most recent accepted action
  const lastAccepted = acceptedActions[0];

  // Check if the user_id matches the user who last accepted the issue
  if (lastAccepted.user_id !== user_id) {
    return false;
  }

  return true;
};

export const canEscalate = (
  user_id: string,
  issueStatus: string,
  object: any
): boolean => {
  // Check if status is not "in progress"
  if (issueStatus !== "in_progress") {
    return false;
  }

  // Check if user_id exists in any escalation
  if (
    object?.escalations?.some(
      (escalation: any) =>
        escalation.escalated_by === user_id ||
        escalation.escalator?.user_id === user_id
    )
  ) {
    return false;
  }

  return true;
};
