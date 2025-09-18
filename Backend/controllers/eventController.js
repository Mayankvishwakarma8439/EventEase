import Event from "../models/Event.js";

const getEvents =async (req,res)=>{
try {
    const events = await Event.find().populate("createdBy","username email").populate("attendees","username email");
    return res.status(200).json(events);
} catch (error) {
    return res.status(500).json({
        message:"Error fetching events",
        error
    })
}
}

const registerEvent = async (req,res)=>{
try {
    const {eventId} = req.params.id;
    const userId = req.user._id;
    const event = await Event.findById(eventId);
    if(!event)return res.status(400).json({
        message:"Event doesn't exist"
    })
    if(event.attendees.includes(userId)){
        return res.status(400).json({
            message:"User already registered"
        })
    }
    event.attendees.push(userId)
    await event.save();

    return res.status(200).json({
        message:"User registered successfully"
    })
} catch (error) {
    
}
}
const createEvent = async (req,res)=>{
try {
    const {title,description} = req.body;
    if(!title || !description)return res.status(400).json({message:"Please provide both title and description!"});
    const userId = req.user._id;
    const newEvent = await Event.create({
        title,
        description,
        createdBy: userId,
        attendees: []
    })
    return res.status(200).json({message:"Event created successfully",event:newEvent})
} catch (error) {
    return res.status(500).json({
        message:"Error in creating Event",
        error
    })
}
}
const deleteEvent =async (req,res)=>{
try {
    const eventId = req.params.id;
    const userId = req.user._id;
    const event = await Event.findById(eventId)
    if(!event)return res.status(400).json({message:"Event not found"})
    if(event.createdBy.toString() != userId.toString()){
        return res.status(401).json({
            message:"Not authorized to delete this event"
        })
    }
    await Event.findByIdAndDelete(eventId)
    res.status(200).json({
        message:"Event deleted successfully"
    })
} catch (error) {
    return res.status(500).json({
        message:"Error deleting event",
        error
    })
}
}
export const updateEvent = (req,res)=>{

}
export const getMyEvents = (req,res)=>{

}
export const getEventById = (req,res)=>{

}
export const unregisterEvent = (req,res)=>{

}

export {deleteEvent,getEvents,registerEvent,createEvent}
