const db = require("../config/db");

class Classroom {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM classroom");
    return rows;
  }

  static async getById(classroom_id) {
    const [rows] = await db.query(
      "SELECT * FROM classroom WHERE classroom_id = ?",
      [classroom_id]
    );
    return rows[0];
  }
  static async getByIds(classroomIds) {
    if (!classroomIds || classroomIds.length === 0) return [];
    
    const [rows] = await db.query(
      "SELECT * FROM classroom WHERE classroom_id IN (?)",
      [classroomIds]
    );
    return rows;
  }
  static async create(
    college_id,
    code,
    capacity,
    location,
    equipment,
    status,
    desk_capacity,
    air_conditioner_count,
    multimedia_equipment,
    photo_url
  ) {
    const [result] = await db.query(
      "INSERT INTO classroom (college_id, code, capacity, location, equipment, status, desk_capacity, air_conditioner_count, multimedia_equipment, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        college_id,
        code,
        capacity,
        location,
        equipment,
        status,
        desk_capacity,
        air_conditioner_count,
        multimedia_equipment,
        photo_url,
      ]
    );
    return result.insertId;
  }

  static async update(
    classroom_id,
    college_id,
    code,
    capacity,
    location,
    equipment,
    status,
    desk_capacity,
    air_conditioner_count,
    multimedia_equipment,
    photo_url
  ) {
    await db.query(
      "UPDATE classroom SET college_id = ?, code = ?, capacity = ?, location = ?, equipment = ?, status = ?, desk_capacity = ?, air_conditioner_count = ?, multimedia_equipment = ?, photo_url = ? WHERE classroom_id = ?",
      [
        college_id,
        code,
        capacity,
        location,
        equipment,
        status,
        desk_capacity,
        air_conditioner_count,
        multimedia_equipment,
        photo_url,
        classroom_id,
      ]
    );
  }

  static async delete(classroom_id) {
    await db.query("DELETE FROM classroom WHERE classroom_id = ?", [
      classroom_id,
    ]);
  }
}

module.exports = Classroom;
