import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions, initializeFirebase } from "../services/firebase";

const functions = getFirebaseFunctions();

export function followUser(targetUserId) {
    
    const followUserFunc = httpsCallable(functions, "followUser");
    return followUserFunc({ targetUserId });
}

export function unfollowUser(targetUserId) {
    const unfollowUserFunc = httpsCallable(functions, "unfollowUser");
    return unfollowUserFunc({ targetUserId });
}

export function blockUser(targetUserId) {
    const blockUserFunc = httpsCallable(functions, "blockUser");
    return blockUserFunc({ targetUserId });
}

export function unblockUser(targetUserId) {
    const unblockUserFunc = httpsCallable(functions, "unblockUser");
    return unblockUserFunc({ targetUserId });
}

export function addNotification(targetUserId, type) {
  const func = httpsCallable(functions, "addNotification");
  return func({ targetUserId, type });
}

