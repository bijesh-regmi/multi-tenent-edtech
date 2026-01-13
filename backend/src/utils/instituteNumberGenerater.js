function generateInstituteId(prefix = "INST", length = 8) {
    
    return Math.floor(1000 + Math.random() * 9000).toString();
}
export default generateInstituteId;
