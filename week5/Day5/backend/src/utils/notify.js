import Notification from "../models/Notification.js";

// Creates a notification, unless the actor is doing this to themselves
// (liking your own post, commenting on your own post — self-follow is
// already blocked earlier in followController). Never throws: a failed
// notification should not break the like/comment/follow it came from.
export const notify = async ({ recipient, actor, type, post, comment}) => {
    if (String(recipient) === String(actor)) return;

    try {
        await Notification.create({ recipient, actor, type, post, comment });
    } catch (error) {
        console.error("Failed to create notification:", error.message);
    }
};

// Undoes a notification when its action is undone (unlike, unfollow,
// deleting a comment). Never throws, for the same reason as notify().
export const unnotify = async (filter) => {
    try {
        await Notification.deleteMany(filter);
    } catch (error) {
        console.error("Failed to remove notification:", error.message);
    }
};